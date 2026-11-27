import type { INodeProperties } from 'n8n-workflow';
import { show, toChatId, whatsappPath } from './shared';

const R = 'whatsappContact';

export const whatsappContactDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [R] } },
		options: [
			{ name: 'Check Number', value: 'checkExists', action: 'Check if number has account', description: 'Check whether a phone number has a WhatsApp account', routing: { request: { method: 'POST', url: whatsappPath('contacts/check-exists') } } },
			{ name: 'Get', value: 'get', action: 'Get contact', routing: { request: { method: 'GET', url: whatsappPath('contacts/get') } } },
		],
		default: 'checkExists',
	},
	{
		displayName: 'Phone Number',
		name: 'phone',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 201234567890',
		description: 'With country code. Spaces, dashes and the plus sign are removed.',
		displayOptions: show(R, ['checkExists']),
		routing: { send: { type: 'body', property: 'phone', value: `={{ String($value).replace(/\\D/g, '') }}` } },
	},
	{
		displayName: 'Chat ID',
		name: 'chatId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 201234567890',
		description: 'Phone number with country code, or a full chat ID such as 201234567890@c.us',
		displayOptions: show(R, ['get']),
		routing: { send: { type: 'query', property: 'chat_id', value: toChatId } },
	},
];
