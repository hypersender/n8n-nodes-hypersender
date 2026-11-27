import type { INodeProperties } from 'n8n-workflow';

/** Phone digits become a WhatsApp chat ID (201234567890 -> 201234567890@c.us); IDs that already have an @ pass through. */
export const toChatId = `={{ (v => v.includes('@') || v === '' ? v : v.replace(/\\D/g, '') + '@c.us')(String($value ?? '').trim()) }}`;

/** Defaults that read the Hypersender Trigger's output, so Trigger -> reply works without mapping fields. */
export const FROM_TRIGGER = {
	chatId: "={{ $json.data?.payload?.from ?? '' }}",
	messageId: "={{ $json.data?.payload?.id ?? '' }}",
	smsFrom: "={{ $json.data?.from_phone_number ?? '' }}",
};

export const whatsappPath = (endpoint: string) =>
	`=/whatsapp/v2/{{ toPathSegment($credentials.instanceId) }}/${endpoint}`;

export const show = (resource: string, operation: string[]) => ({ show: { resource: [resource], operation } });

/** A field sent under its own name in the body (or the query). */
export const bodyField = (
	property: INodeProperties,
	operations: string[],
	resource: string,
	bodyName = property.name,
	type: 'body' | 'query' = 'body',
): INodeProperties => ({
	...property,
	displayOptions: show(resource, operations),
	routing: { send: { type, property: bodyName } },
});

export const chatIdField = (
	resource: string,
	operations: string[],
	defaultValue: string = FROM_TRIGGER.chatId,
	type: 'body' | 'query' = 'body',
): INodeProperties => ({
	displayName: 'Chat ID',
	name: 'chatId',
	type: 'string',
	default: defaultValue,
	required: true,
	placeholder: 'e.g. 201234567890',
	description:
		'Phone number with country code and no plus sign, or a full chat ID such as 201234567890@c.us or a group ID ending in @g.us. After a Hypersender Trigger it defaults to the sender.',
	displayOptions: show(resource, operations),
	routing: { send: { type, property: 'chatId', value: toChatId } },
});
