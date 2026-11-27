import type { INodeProperties } from 'n8n-workflow';
import { bodyField, chatIdField, show, whatsappPath } from './shared';

const R = 'whatsappMessage';
const MEDIA = ['sendImage', 'sendVideo', 'sendFile', 'sendVoice'];
const send = (endpoint: string) => ({ request: { method: 'POST' as const, url: whatsappPath(endpoint) } });

export const whatsappMessageDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [R] } },
		options: [
			{ name: 'Get Request Status', value: 'getRequestStatus', action: 'Get status of queued message', description: 'Check whether a queued send was processed', routing: { request: { method: 'GET', url: whatsappPath('queued-requests/{{ toPathSegment($parameter.requestId) }}') } } },
			{ name: 'Mark Chat as Read', value: 'markAsRead', action: 'Mark chat as read', routing: send('read-chat') },
			{ name: 'React', value: 'react', action: 'React to message', description: 'Add an emoji reaction to a message', routing: { request: { method: 'PUT', url: whatsappPath('react-to-message') } } },
			{ name: 'Send File', value: 'sendFile', action: 'Send file', description: 'Send a document from a URL', routing: send('send-file') },
			{ name: 'Send Image', value: 'sendImage', action: 'Send image', description: 'Send an image from a URL', routing: send('send-image') },
			{ name: 'Send Location', value: 'sendLocation', action: 'Send location', routing: send('send-location') },
			{ name: 'Send Poll', value: 'sendPoll', action: 'Send poll', routing: send('send-poll') },
			{ name: 'Send Text', value: 'sendText', action: 'Send text message', description: 'Send a text message, with a typing indicator and human-like delay first', routing: send('send-text-safe') },
			{ name: 'Send Video', value: 'sendVideo', action: 'Send video', description: 'Send a video from a URL', routing: send('send-video') },
			{ name: 'Send Voice Note', value: 'sendVoice', action: 'Send voice note', description: 'Send an audio file from a URL as a voice note', routing: send('send-voice') },
		],
		default: 'sendText',
	},

	chatIdField(R, ['sendText', ...MEDIA, 'sendLocation', 'sendPoll', 'react', 'markAsRead']),

	bodyField({ displayName: 'Text', name: 'text', type: 'string', typeOptions: { rows: 4 }, default: '', required: true, description: 'Message text. WhatsApp formatting such as *bold* and _italic_ works.' }, ['sendText'], R),
	bodyField({ displayName: 'File URL', name: 'url', type: 'string', default: '', required: true, placeholder: 'e.g. https://example.com/invoice.pdf', description: 'Public URL Hypersender downloads the file from' }, MEDIA, R),

	bodyField({ displayName: 'Latitude', name: 'latitude', type: 'number', typeOptions: { numberPrecision: 6 }, default: 0, required: true }, ['sendLocation'], R),
	bodyField({ displayName: 'Longitude', name: 'longitude', type: 'number', typeOptions: { numberPrecision: 6 }, default: 0, required: true }, ['sendLocation'], R),

	{
		displayName: 'Question',
		name: 'pollName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: show(R, ['sendPoll']),
		routing: { send: { type: 'body', property: 'poll.name' } },
	},
	{
		displayName: 'Options',
		name: 'pollOptions',
		type: 'string',
		typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Option' },
		default: [],
		required: true,
		description: 'The answers people can pick',
		displayOptions: show(R, ['sendPoll']),
		routing: { send: { type: 'body', property: 'poll.options' } },
	},
	{
		displayName: 'Allow Multiple Answers',
		name: 'multipleAnswers',
		type: 'boolean',
		default: false,
		description: 'Whether people can pick more than one option',
		displayOptions: show(R, ['sendPoll']),
		routing: { send: { type: 'body', property: 'poll.multipleAnswers' } },
	},

	bodyField({ displayName: 'Message ID', name: 'messageId', type: 'string', default: '', required: true, description: 'ID of the message to react to, from a send result or a webhook' }, ['react'], R),
	bodyField({ displayName: 'Reaction', name: 'reaction', type: 'string', default: '👍', description: 'One emoji. Leave empty to remove your reaction.' }, ['react'], R),

	{
		displayName: 'Request ID',
		name: 'requestId',
		type: 'string',
		default: '',
		required: true,
		description: "The 'queued_request_uuid' returned when the message was sent",
		displayOptions: show(R, ['getRequestStatus']),
	},

	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: show(R, ['sendText', ...MEDIA, 'sendLocation', 'sendPoll']),
		options: [
			{ displayName: 'Caption', name: 'caption', type: 'string', default: '', displayOptions: { show: { '/operation': ['sendImage', 'sendVideo', 'sendFile'] } }, routing: { send: { type: 'body', property: 'caption' } } },
			{ displayName: 'File Name', name: 'filename', type: 'string', default: '', placeholder: 'e.g. invoice.pdf', displayOptions: { show: { '/operation': ['sendImage', 'sendVideo', 'sendFile'] } }, routing: { send: { type: 'body', property: 'filename' } } },
			{ displayName: 'Link Preview', name: 'link_preview', type: 'boolean', default: true, description: 'Whether to show a preview for the first link in the text', displayOptions: { show: { '/operation': ['sendText'] } }, routing: { send: { type: 'body', property: 'link_preview' } } },
			{ displayName: 'Location Name', name: 'title', type: 'string', default: '', displayOptions: { show: { '/operation': ['sendLocation'] } }, routing: { send: { type: 'body', property: 'title' } } },
			{ displayName: 'MIME Type', name: 'mimetype', type: 'string', default: '', placeholder: 'e.g. application/pdf', displayOptions: { show: { '/operation': ['sendImage', 'sendVideo', 'sendFile'] } }, routing: { send: { type: 'body', property: 'mimetype' } } },
			{ displayName: 'Reply To Message ID', name: 'reply_to', type: 'string', default: '', description: 'ID of the message to quote in the reply', routing: { send: { type: 'body', property: 'reply_to' } } },
		],
	},
];
