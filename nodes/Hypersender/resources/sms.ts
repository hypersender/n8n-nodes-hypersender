import type { INodeProperties } from 'n8n-workflow';
import { show } from './shared';

const R = 'sms';
const smsPath = (endpoint: string) => `=/sms/v1/{{ toPathSegment($credentials.instanceId) }}/${endpoint}`;

export const smsDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [R] } },
		options: [
			{ name: 'Get Many', value: 'getAll', action: 'Get many SMS messages', description: 'List sent and received messages, newest first', routing: { request: { method: 'GET', url: smsPath('messages') }, output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] } } },
			{ name: 'Send', value: 'send', action: 'Send SMS', description: 'Send an SMS from the SIM in your Android phone', routing: { request: { method: 'POST', url: smsPath('send-message') } } },
		],
		default: 'send',
	},

	{
		displayName: 'To',
		name: 'to',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. +12025550101',
		description: 'Recipient phone number in international format',
		displayOptions: show(R, ['send']),
		routing: { send: { type: 'body', property: 'to' } },
	},
	{
		displayName: 'Message',
		name: 'content',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		description: 'Up to 1,600 characters. Longer text goes out as a multipart SMS.',
		displayOptions: show(R, ['send']),
		routing: { send: { type: 'body', property: 'content' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: show(R, ['send']),
		options: [
			{ displayName: 'Expires After (Seconds)', name: 'message_expiration_seconds', type: 'number', default: 0, description: 'How long the message stays valid if the phone has not sent it yet. 0 uses the phone setting.', routing: { send: { type: 'body', property: 'message_expiration_seconds' } } },
			{ displayName: 'Max Send Attempts', name: 'max_send_attempts', type: 'number', default: 3, description: 'How many times Hypersender tries to push the message to the phone', routing: { send: { type: 'body', property: 'max_send_attempts' } } },
			{ displayName: 'Request ID', name: 'request_id', type: 'string', default: '', description: 'Your own ID for this message. Retrying with the same ID does not send it twice.', routing: { send: { type: 'body', property: 'request_id' } } },
			{ displayName: 'Send At', name: 'schedule_send_at', type: 'string', default: '', placeholder: 'e.g. 2026-12-01 09:30:00', description: "Send later, in the phone's time zone (YYYY-MM-DD HH:MM:SS)", routing: { send: { type: 'body', property: 'schedule_send_at' } } },
		],
	},

	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: show(R, ['getAll']),
		routing: {
			send: { paginate: '={{ $value }}', type: 'query', property: 'per_page', value: '50' },
			operations: {
				pagination: {
					type: 'generic',
					properties: {
						continue: '={{ !!$response.body?.links?.next }}',
						request: { url: '={{ $response.body?.links?.next ?? $request.url }}' },
					},
				},
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 50 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: [R], operation: ['getAll'], returnAll: [false] } },
		routing: { send: { type: 'query', property: 'per_page' }, output: { maxResults: '={{$value}}' } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: show(R, ['getAll']),
		options: [
			{ displayName: 'From Phone Number', name: 'from', type: 'string', default: '', placeholder: 'e.g. +12025550188', routing: { send: { type: 'query', property: 'filter[from_phone_number]' } } },
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'received',
				options: ['pending', 'scheduled', 'sending', 'sent', 'delivered', 'failed', 'expired', 'received', 'deleted'].map((value) => ({ name: value[0].toUpperCase() + value.slice(1), value })),
				routing: { send: { type: 'query', property: 'filter[status]' } },
			},
			{ displayName: 'To Phone Number', name: 'to', type: 'string', default: '', placeholder: 'e.g. +12025550101', routing: { send: { type: 'query', property: 'filter[to_phone_number]' } } },
		],
	},
];
