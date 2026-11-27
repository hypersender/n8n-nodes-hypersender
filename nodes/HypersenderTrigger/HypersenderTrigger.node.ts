import { randomBytes, timingSafeEqual } from 'node:crypto';
import {
	NodeConnectionTypes,
	type IDataObject,
	type IHookFunctions,
	type INodeExecutionData,
	type ILoadOptionsFunctions,
	type INodePropertyOptions,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
	type IWebhookResponseData,
} from 'n8n-workflow';

const BASE_URL = 'https://app.hypersender.com/api';

const EVENTS: Record<string, string[][]> = {
	whatsapp: [
		['message.any', 'Any message (incoming and sent)'],
		['message.ack', 'Message delivered or read'],
		['message.waiting', 'Message waiting for decryption'],
		['message.revoked', 'Message deleted for everyone'],
		['messages.reaction', 'Reaction added or removed'],
		['poll.vote', 'Poll vote'],
		['poll.vote.failed', 'Poll vote could not be decrypted'],
		['presence.update', 'Contact online or typing'],
	],
	sms: [
		['message.phone.received', 'SMS received'],
		['message.phone.sent', 'SMS sent'],
		['message.phone.delivered', 'SMS delivered'],
		['message.send.failed', 'SMS failed'],
		['message.send.expired', 'SMS expired'],
		['message.notification.scheduled', 'SMS scheduled'],
		['message.notification.failed', 'Phone could not be reached'],
		['message.phone.ussd', 'USSD response'],
		['phone.heartbeat.online', 'Phone online'],
		['phone.heartbeat.offline', 'Phone offline'],
		['phone.heartbeat.missed', 'Heartbeat missed'],
		['phone.heartbeat.received', 'Heartbeat received'],
		['phone.heartbeat.disabled', 'Heartbeats disabled'],
		['phone.logout', 'Phone logged out'],
	],
};

type Credentials = { instanceType: 'whatsapp' | 'sms'; instanceId: string };
type WebhookData = { webhookId?: number; secret?: string };

const webhooksPath = ({ instanceType, instanceId }: Credentials) =>
	`${BASE_URL}/${instanceType === 'sms' ? 'sms/v1' : 'whatsapp/v2'}/${encodeURIComponent(instanceId)}/webhooks`;

async function api(this: IHookFunctions, method: 'GET' | 'POST' | 'DELETE', path = '', body?: IDataObject) {
	const credentials = await this.getCredentials<Credentials>('hypersenderApi');
	return this.helpers.httpRequestWithAuthentication.call(this, 'hypersenderApi', {
		method,
		url: webhooksPath(credentials) + path,
		headers: { Accept: 'application/json' },
		body,
		json: true,
	});
}

export class HypersenderTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Hypersender Trigger',
		name: 'hypersenderTrigger',
		icon: { light: 'file:../../icons/hypersender.svg', dark: 'file:../../icons/hypersender.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Starts the workflow when your Hypersender WhatsApp or SMS instance sends an event',
		defaults: { name: 'Hypersender Trigger' },
		inputs: [],
		// One output per chosen event (like WAHA's trigger), so each event can go down its own branch.
		outputs: `={{ ($parameter.events?.length ? $parameter.events : ['${NodeConnectionTypes.Main}']).map((event) => ({ type: '${NodeConnectionTypes.Main}', displayName: event })) }}`,
		credentials: [{ name: 'hypersenderApi', required: true }],
		webhooks: [{ name: 'default', httpMethod: 'POST', responseMode: 'onReceived', path: 'webhook' }],
		properties: [
			{
				displayName: 'Event Names or IDs',
				name: 'events',
				type: 'multiOptions',
				typeOptions: { loadOptionsMethod: 'getEvents' },
				default: [],
				required: true,
				description:
					'Events that start the workflow. Each event gets its own output. The list depends on whether the credential is a WhatsApp or SMS instance. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Ignore My Own Messages',
				name: 'ignoreFromMe',
				type: 'boolean',
				default: true,
				description:
					'Whether to skip WhatsApp messages sent from your own number, so a reply workflow does not answer itself',
			},
		],
	};

	methods = {
		loadOptions: {
			async getEvents(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const { instanceType } = await this.getCredentials<Credentials>('hypersenderApi');
				return (EVENTS[instanceType] ?? EVENTS.whatsapp).map(([value, name]) => ({ name, value, description: value }));
			},
		},
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node') as WebhookData;
				if (!data.webhookId || !data.secret) return false;
				const { data: webhooks } = (await api.call(this, 'GET')) as { data: IDataObject[] };
				const url = this.getNodeWebhookUrl('default');
				if (webhooks.some((webhook) => webhook.id === data.webhookId && webhook.url === url)) return true;
				delete data.webhookId;
				delete data.secret;
				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const secret = randomBytes(32).toString('hex');
				const response = (await api.call(this, 'POST', '', {
					name: `n8n: ${this.getWorkflow().name ?? this.getWorkflow().id}`.slice(0, 100),
					url: this.getNodeWebhookUrl('default'),
					events: this.getNodeParameter('events') as string[],
					authorization_secret: secret,
				})) as { data: { id: number } };
				const data = this.getWorkflowStaticData('node') as WebhookData;
				data.webhookId = response.data.id;
				data.secret = secret;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node') as WebhookData;
				if (data.webhookId) {
					try {
						await api.call(this, 'DELETE', `/${data.webhookId}`);
					} catch (error) {
						// Already deleted in the dashboard: nothing left to clean up.
						if ((error as { httpCode?: string }).httpCode !== '404') return false;
					}
				}
				delete data.webhookId;
				delete data.secret;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const { secret } = this.getWorkflowStaticData('node') as WebhookData;
		const received = Buffer.from(String(this.getHeaderData().authorization ?? ''));
		const expected = Buffer.from(secret ?? '');
		if (expected.length === 0 || received.length !== expected.length || !timingSafeEqual(received, expected)) {
			this.getResponseObject().status(403).json({ message: 'Authorization secret does not match' });
			return { noWebhookResponse: true };
		}

		const body = this.getBodyData();
		if (this.getNodeParameter('ignoreFromMe', true)) {
			const payload = (body.data as IDataObject | undefined)?.payload as IDataObject | undefined;
			if (payload?.fromMe === true) return {};
		}

		const events = this.getNodeParameter('events', []) as string[];
		const index = events.indexOf(String(body.event));
		if (index === -1) return {};
		const workflowData = events.map(() => [] as INodeExecutionData[]);
		workflowData[index] = this.helpers.returnJsonArray(body);
		return { workflowData };
	}
}
