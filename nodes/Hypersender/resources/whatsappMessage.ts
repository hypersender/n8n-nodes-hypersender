import type { INodeProperties } from 'n8n-workflow';
import { bodyField, chatIdField, FROM_TRIGGER, show, whatsappPath } from './shared';

const R = 'whatsappMessage';
const MEDIA = ['sendImage', 'sendVideo', 'sendFile', 'sendVoice'];
const SENDS = ['sendText', 'sendLinkPreview', ...MEDIA, 'sendLocation', 'sendPoll', 'sendContact'];
const WITH_MESSAGE_ID = ['react', 'sendSeen', 'forward', 'star'];
const req = (method: 'POST' | 'PUT' | 'DELETE' | 'GET', endpoint: string) => ({ request: { method, url: whatsappPath(endpoint) } });

export const whatsappMessageDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [R] } },
		options: [
			{ name: 'Delete', value: 'delete', action: 'Delete message for everyone', routing: req('DELETE', 'delete-message') },
			{ name: 'Forward', value: 'forward', action: 'Forward message', description: 'Forward a message to another chat', routing: req('POST', 'forward-message') },
			{ name: 'Get Request Status', value: 'getRequestStatus', action: 'Get status of queued message', description: 'Check whether a queued send was processed', routing: req('GET', 'queued-requests/{{ toPathSegment($parameter.requestId) }}') },
			{ name: 'Mark as Seen', value: 'sendSeen', action: 'Mark message as seen', description: 'Show blue ticks on a message', routing: req('POST', 'send-seen') },
			{ name: 'Mark Chat as Read', value: 'markAsRead', action: 'Mark chat as read', description: 'Mark the latest messages in a chat as read', routing: req('POST', 'read-chat') },
			{ name: 'React', value: 'react', action: 'React to message', description: 'Add an emoji reaction to a message', routing: req('PUT', 'react-to-message') },
			{ name: 'Send Contact Card', value: 'sendContact', action: 'Send contact card', routing: req('POST', 'send-contact-card') },
			{ name: 'Send File', value: 'sendFile', action: 'Send file', description: 'Send a document from a URL', routing: req('POST', 'send-file') },
			{ name: 'Send Image', value: 'sendImage', action: 'Send image', description: 'Send an image from a URL', routing: req('POST', 'send-image') },
			{ name: 'Send Link With Custom Preview', value: 'sendLinkPreview', action: 'Send link with custom preview', description: 'Send a link with your own preview title, text and image', routing: req('POST', 'send-link-custom-preview') },
			{ name: 'Send Location', value: 'sendLocation', action: 'Send location', routing: req('POST', 'send-location') },
			{ name: 'Send Poll', value: 'sendPoll', action: 'Send poll', routing: req('POST', 'send-poll') },
			{ name: 'Send Text', value: 'sendText', action: 'Send text message', description: 'Send a text message, with a typing indicator and human-like delay first', routing: req('POST', 'send-text-safe') },
			{ name: 'Send Video', value: 'sendVideo', action: 'Send video', description: 'Send a video from a URL', routing: req('POST', 'send-video') },
			{ name: 'Send Voice Note', value: 'sendVoice', action: 'Send voice note', description: 'Send an audio file from a URL as a voice note', routing: req('POST', 'send-voice') },
			{ name: 'Star', value: 'star', action: 'Star or unstar message', routing: req('PUT', 'star-message') },
			{ name: 'Start Typing', value: 'startTyping', action: 'Show typing indicator', routing: req('POST', 'start-typing') },
			{ name: 'Stop Typing', value: 'stopTyping', action: 'Hide typing indicator', routing: req('POST', 'stop-typing') },
		],
		default: 'sendText',
	},

	chatIdField(R, [...SENDS, 'react', 'sendSeen', 'star', 'markAsRead', 'startTyping', 'stopTyping']),
	chatIdField(R, ['delete'], FROM_TRIGGER.chatId, 'query'),
	{ ...chatIdField(R, ['forward'], ''), displayName: 'Forward To (Chat ID)', description: 'Phone number with country code, or a chat or group ID, to forward the message to' },

	{
		displayName: 'Message ID',
		name: 'messageId',
		type: 'string',
		default: "={{ $json.data?.payload?.id ?? '' }}",
		required: true,
		description: 'ID of the message, from a send result or a Hypersender Trigger (the default)',
		displayOptions: show(R, WITH_MESSAGE_ID),
		routing: { send: { type: 'body', property: 'messageId' } },
	},
	{
		displayName: 'Message ID',
		name: 'messageId',
		type: 'string',
		default: "={{ $json.data?.payload?.id ?? '' }}",
		required: true,
		description: 'ID of the message to delete',
		displayOptions: show(R, ['delete']),
		routing: { send: { type: 'query', property: 'messageId' } },
	},

	bodyField({ displayName: 'Text', name: 'text', type: 'string', typeOptions: { rows: 4 }, default: '', required: true, description: 'Message text. WhatsApp formatting such as *bold* and _italic_ works.' }, ['sendText'], R),
	bodyField({ displayName: 'Text', name: 'text', type: 'string', typeOptions: { rows: 4 }, default: '', required: true, description: 'Message text. It must contain the link.' }, ['sendLinkPreview'], R),
	bodyField({ displayName: 'Preview URL', name: 'preview_url', type: 'string', default: '', required: true, placeholder: 'e.g. https://example.com/offer' }, ['sendLinkPreview'], R),
	bodyField({ displayName: 'Preview Title', name: 'preview_title', type: 'string', default: '', required: true }, ['sendLinkPreview'], R),
	bodyField({ displayName: 'Preview Description', name: 'preview_description', type: 'string', default: '', required: true }, ['sendLinkPreview'], R),
	bodyField({ displayName: 'File URL', name: 'url', type: 'string', default: '', required: true, placeholder: 'e.g. https://example.com/invoice.pdf', description: 'Public URL Hypersender downloads the file from' }, MEDIA, R),

	bodyField({ displayName: 'Latitude', name: 'latitude', type: 'number', typeOptions: { numberPrecision: 6 }, default: 0, required: true }, ['sendLocation'], R),
	bodyField({ displayName: 'Longitude', name: 'longitude', type: 'number', typeOptions: { numberPrecision: 6 }, default: 0, required: true }, ['sendLocation'], R),

	{ displayName: 'Question', name: 'pollName', type: 'string', default: '', required: true, displayOptions: show(R, ['sendPoll']), routing: { send: { type: 'body', property: 'poll.name' } } },
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
	{ displayName: 'Allow Multiple Answers', name: 'multipleAnswers', type: 'boolean', default: false, description: 'Whether people can pick more than one option', displayOptions: show(R, ['sendPoll']), routing: { send: { type: 'body', property: 'poll.multipleAnswers' } } },

	{
		displayName: 'Contact Name',
		name: 'contactName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: show(R, ['sendContact']),
		routing: {
			send: {
				type: 'body',
				property: 'contacts',
				value: "={{ [{ fullName: $value, phoneNumber: String($parameter.contactPhone).replace(/\\D/g, ''), whatsappId: String($parameter.contactPhone).replace(/\\D/g, ''), organization: $parameter.contactOrganization || undefined }] }}",
			},
		},
	},
	{ displayName: 'Contact Phone Number', name: 'contactPhone', type: 'string', default: '', required: true, placeholder: 'e.g. 201234567890', displayOptions: show(R, ['sendContact']) },
	{ displayName: 'Contact Organization', name: 'contactOrganization', type: 'string', default: '', displayOptions: show(R, ['sendContact']) },

	bodyField({ displayName: 'Reaction', name: 'reaction', type: 'string', default: '👍', description: 'One emoji. Leave empty to remove your reaction.' }, ['react'], R),
	bodyField({ displayName: 'Star', name: 'star', type: 'boolean', default: true, description: 'Whether to star the message. Turn off to unstar it.' }, ['star'], R),

	{
		displayName: 'Request ID',
		name: 'requestId',
		type: 'string',
		default: "={{ $json.queued_request_uuid ?? '' }}",
		required: true,
		description: "The 'queued_request_uuid' returned when the message was sent (the default right after a send)",
		displayOptions: show(R, ['getRequestStatus']),
	},

	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: show(R, [...SENDS, 'sendSeen']),
		options: [
			{ displayName: 'Caption', name: 'caption', type: 'string', default: '', displayOptions: { show: { '/operation': ['sendImage', 'sendVideo', 'sendFile'] } }, routing: { send: { type: 'body', property: 'caption' } } },
			{ displayName: 'File Name', name: 'filename', type: 'string', default: '', placeholder: 'e.g. invoice.pdf', displayOptions: { show: { '/operation': ['sendImage', 'sendVideo', 'sendFile'] } }, routing: { send: { type: 'body', property: 'filename' } } },
			{ displayName: 'Group Participant', name: 'participant', type: 'string', default: '', description: 'In a group, the participant who sent the message', displayOptions: { show: { '/operation': ['sendSeen'] } }, routing: { send: { type: 'body', property: 'participant' } } },
			{ displayName: 'Link Preview', name: 'link_preview', type: 'boolean', default: true, description: 'Whether to show a preview for the first link in the text', displayOptions: { show: { '/operation': ['sendText'] } }, routing: { send: { type: 'body', property: 'link_preview' } } },
			{ displayName: 'Location Name', name: 'title', type: 'string', default: '', displayOptions: { show: { '/operation': ['sendLocation'] } }, routing: { send: { type: 'body', property: 'title' } } },
			{ displayName: 'MIME Type', name: 'mimetype', type: 'string', default: '', placeholder: 'e.g. application/pdf', displayOptions: { show: { '/operation': ['sendImage', 'sendVideo', 'sendFile'] } }, routing: { send: { type: 'body', property: 'mimetype' } } },
			{ displayName: 'Preview Image URL', name: 'preview_image_url', type: 'string', default: '', displayOptions: { show: { '/operation': ['sendLinkPreview'] } }, routing: { send: { type: 'body', property: 'preview_image_url' } } },
			{ displayName: 'Reply To Message ID', name: 'reply_to', type: 'string', default: '', description: 'ID of the message to quote in the reply', displayOptions: { hide: { '/operation': ['sendSeen'] } }, routing: { send: { type: 'body', property: 'reply_to' } } },
		],
	},
];
