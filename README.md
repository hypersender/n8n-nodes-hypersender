# n8n-nodes-hypersender

An [n8n](https://n8n.io) community node for [Hypersender](https://hypersender.com). Send WhatsApp messages from your own number, send SMS from the SIM in your Android phone, and send and verify OTP codes, without writing HTTP requests.

[Installation](#installation) · [Credentials](#credentials) · [Operations](#operations) · [Incoming messages](#incoming-messages) · [Example](#example) · [Resources](#resources)

## Installation

In n8n, open **Settings → Community Nodes → Install**, enter `n8n-nodes-hypersender`, and confirm. See the [n8n guide to installing community nodes](https://docs.n8n.io/integrations/community-nodes/installation/) for self-hosted setups.

## Credentials

You need a [Hypersender account](https://app.hypersender.com) with a WhatsApp instance connected by QR code, or the Hypersender SMS app installed on an Android phone.

Create a **Hypersender API** credential for each instance you use:

1. **Instance Type**: WhatsApp or SMS. OTP codes go through a WhatsApp instance.
2. **Instance ID**: open the instance in the Hypersender dashboard and copy its ID.
3. **API Key**: create one on the API keys page of the dashboard.

n8n tests the credential by making a read-only request to that instance.

## Operations

**WhatsApp Message**

- Send Text: sends with a typing indicator and a short, human-like delay first
- Send Image, Send Video, Send File, Send Voice Note: from a public URL
- Send Location
- Send Poll
- React to a message with an emoji
- Mark Chat as Read
- Get Request Status: WhatsApp sends are queued. The response has a `queued_request_uuid` you can check here.

**WhatsApp Contact**

- Check Number: whether a phone number has a WhatsApp account
- Get: a contact's details

**SMS**

- Send: from your Android phone, with an optional schedule, retry limit, expiry and your own request ID (retrying with the same ID doesn't send twice)
- Get Many: sent and received messages, with filters for status and phone numbers

**OTP**

- Send Code over WhatsApp
- Verify Code
- Create Sign-In Link: a link that opens WhatsApp with a prefilled message; the user is verified when they send it

For WhatsApp, the **Chat ID** field takes a phone number with its country code (`201234567890`), which the node turns into `201234567890@c.us`. You can also paste a full chat ID, including group IDs ending in `@g.us`.

The node can be used as a tool by n8n's AI Agent.

## Incoming messages

To start a workflow when a message arrives, use n8n's **Webhook** node:

1. Add a Webhook node with method `POST`. Under Authentication, choose **Header Auth** and create a credential whose name is `Authorization` and whose value is a long random secret.
2. In the Hypersender dashboard, add a webhook to your instance with the Webhook node's Production URL, and paste the same secret as its Authorization Secret.
3. WhatsApp messages arrive as `message.any` events (the text is in `body.data.payload.body`, the sender in `body.data.payload.from`). SMS arrive as `message.phone.received`.

Skip events where `body.data.payload.fromMe` is `true`, or a reply workflow will answer its own messages.

## Example

A WhatsApp auto-reply: **Webhook** (receives `message.any`) → **If** (`fromMe` is false) → **Hypersender**, WhatsApp Message, Send Text, with Chat ID `{{ $json.body.data.payload.from }}`.

A downloadable version of this workflow, and a step-by-step guide, is on the [Hypersender blog](https://hypersender.com/en/blog/n8n-whatsapp).

## Resources

- [Hypersender API documentation](https://docs.hypersender.com)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- Support: [support@hypersender.com](mailto:support@hypersender.com)

## Version history

- 0.1.0: WhatsApp messages and contacts, SMS, and OTP.

## License

[MIT](LICENSE.md)
