import type { INodeProperties } from 'n8n-workflow';

/** Phone digits become a WhatsApp chat ID (201234567890 -> 201234567890@c.us); IDs that already have an @ pass through. */
export const toChatId = `={{ String($value).includes('@') ? String($value).trim() : String($value).replace(/\\D/g, '') + '@c.us' }}`;

export const whatsappPath = (endpoint: string) =>
	`=/whatsapp/v2/{{ toPathSegment($credentials.instanceId) }}/${endpoint}`;

export const show = (resource: string, operation: string[]) => ({ show: { resource: [resource], operation } });

/** A body field sent under its own name. */
export const bodyField = (
	property: INodeProperties,
	operations: string[],
	resource: string,
	bodyName = property.name,
): INodeProperties => ({
	...property,
	displayOptions: show(resource, operations),
	routing: { send: { type: 'body', property: bodyName } },
});

export const chatIdField = (resource: string, operations: string[]): INodeProperties => ({
	displayName: 'Chat ID',
	name: 'chatId',
	type: 'string',
	default: '',
	required: true,
	placeholder: 'e.g. 201234567890',
	description:
		'Phone number with country code and no plus sign, or a full chat ID such as 201234567890@c.us or a group ID ending in @g.us',
	displayOptions: show(resource, operations),
	routing: { send: { type: 'body', property: 'chatId', value: toChatId } },
});
