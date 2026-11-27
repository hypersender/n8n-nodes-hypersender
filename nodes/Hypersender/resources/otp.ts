import type { INodeProperties } from 'n8n-workflow';
import { bodyField, chatIdField, show } from './shared';

const R = 'otp';
const otp = (endpoint: string) => ({ request: { method: 'POST' as const, url: `=/otp/v2/{{ toPathSegment($credentials.instanceId) }}/${endpoint}` } });

export const otpDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [R] } },
		options: [
			{ name: 'Create Sign-In Link', value: 'generateLink', action: 'Create sign in link', description: 'Make a link that opens WhatsApp with a prefilled message. The user is verified when they send it.', routing: otp('generate-link') },
			{ name: 'Send Code', value: 'requestCode', action: 'Send OTP code', description: 'Send a one-time code over WhatsApp', routing: otp('request-code') },
			{ name: 'Verify Code', value: 'validateCode', action: 'Verify OTP code', description: 'Check the code the user typed', routing: otp('validate-code') },
		],
		default: 'requestCode',
	},
	chatIdField(R, ['requestCode', 'validateCode', 'generateLink']),
	bodyField({ displayName: 'Code', name: 'code', type: 'string', default: '', required: true, description: 'The code the user typed' }, ['validateCode'], R),
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: show(R, ['requestCode', 'generateLink']),
		options: [
			{ displayName: 'App Name', name: 'name', type: 'string', default: '', description: 'Name shown in the message', routing: { send: { type: 'body', property: 'name' } } },
			{ displayName: 'Expires After (Seconds)', name: 'expires', type: 'number', default: 300, routing: { send: { type: 'body', property: 'expires' } } },
			{ displayName: 'Code Length', name: 'length', type: 'number', default: 6, displayOptions: { show: { '/operation': ['requestCode'] } }, routing: { send: { type: 'body', property: 'length' } } },
			{ displayName: 'Use Letters', name: 'useLetter', type: 'boolean', default: false, description: 'Whether the code can contain letters', displayOptions: { show: { '/operation': ['requestCode'] } }, routing: { send: { type: 'body', property: 'useLetter' } } },
		],
	},
];
