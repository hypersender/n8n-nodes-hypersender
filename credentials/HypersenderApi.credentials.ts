import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

// One credential per instance: the API routes every request through an instance, so the key can only be tested together with one.
export class HypersenderApi implements ICredentialType {
	name = 'hypersenderApi';

	displayName = 'Hypersender API';

	icon: Icon = { light: 'file:../icons/hypersender.svg', dark: 'file:../icons/hypersender.svg' };

	documentationUrl = 'https://github.com/hypersender/n8n-nodes-hypersender?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'Instance Type',
			name: 'instanceType',
			type: 'options',
			options: [
				{ name: 'WhatsApp (Also Used for OTP)', value: 'whatsapp' },
				{ name: 'SMS', value: 'sms' },
			],
			default: 'whatsapp',
		},
		{
			displayName: 'Instance ID',
			name: 'instanceId',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'e.g. 9f8b7c6d-1111-4a2b-8c3d-4e5f6a7b8c9d',
			description: "From the instance's page in the Hypersender dashboard",
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'From the API keys page in the Hypersender dashboard',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://app.hypersender.com/api',
			url: '={{ $credentials.instanceType === "sms" ? "/sms/v1/" + $credentials.instanceId + "/messages?per_page=1" : "/whatsapp/v2/" + $credentials.instanceId + "/contacts/get-lids-count" }}',
			method: 'GET',
			headers: { Accept: 'application/json' },
		},
	};
}
