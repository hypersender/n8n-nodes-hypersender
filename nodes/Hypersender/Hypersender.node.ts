import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { otpDescription } from './resources/otp';
import { smsDescription } from './resources/sms';
import { whatsappContactDescription } from './resources/whatsappContact';
import { whatsappMessageDescription } from './resources/whatsappMessage';

export class Hypersender implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Hypersender',
		name: 'hypersender',
		icon: { light: 'file:../../icons/hypersender.svg', dark: 'file:../../icons/hypersender.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Send WhatsApp messages from your own number, SMS from your Android phone, and OTP codes',
		defaults: { name: 'Hypersender' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'hypersenderApi', required: true }],
		requestDefaults: {
			baseURL: 'https://app.hypersender.com/api',
			headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'OTP', value: 'otp' },
					{ name: 'SMS', value: 'sms' },
					{ name: 'WhatsApp Contact', value: 'whatsappContact' },
					{ name: 'WhatsApp Message', value: 'whatsappMessage' },
				],
				default: 'whatsappMessage',
			},
			...whatsappMessageDescription,
			...whatsappContactDescription,
			...smsDescription,
			...otpDescription,
		],
	};
}
