# n8n-nodes-hypersender

[n8n](https://n8n.io) community nodes for [Hypersender](https://hypersender.com). Send WhatsApp messages from your own number, send SMS from the SIM in your Android phone, send and verify OTP codes, and start workflows when a message arrives, without writing HTTP requests.

[Installation](#installation) · [Credentials](#credentials) · [Operations](#operations) · [Trigger](#trigger) · [Example](#example) · [Resources](#resources)

## Installation

In n8n, open **Settings → Community Nodes → Install**, enter `n8n-nodes-hypersender`, and confirm. See the [n8n guide to installing community nodes](https://docs.n8n.io/integrations/community-nodes/installation/) for self-hosted setups.

## Credentials

You need a [Hypersender account](https://app.hypersender.com) with a WhatsApp instance connected by QR code, or the Hypersender SMS app installed on an Android phone.

Create a **Hypersender API** credential for each instance you use:

1. **Instance Type**: WhatsApp or SMS. OTP codes go through a WhatsApp instance.
2. **Instance ID**: open the instance in the Hypersender dashboard and copy its ID.
3. **API Key (Bearer Token)**: the instance's access token. The dashboard shows it once when you create the instance. To get a new one, use **Regenerate Access Token** on the instance; the old token stops working.

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

## Trigger

The **Hypersender Trigger** starts a workflow when your instance sends an event, such as a new WhatsApp message (`message.any`) or an incoming SMS (`message.phone.received`). The event list matches the instance type in the credential.

You don't need to touch the Hypersender dashboard. When you activate the workflow, the node creates a webhook on your instance with the workflow's URL and a random secret. It rejects any request that doesn't carry that secret, and deletes the webhook when you deactivate the workflow. The webhook shows up in the dashboard named `n8n: <workflow name>` and counts toward your plan's webhook limit.

**Ignore My Own Messages** (on by default) skips WhatsApp messages sent from your own number, so an auto-reply doesn't answer itself.

Hypersender has to reach your n8n, so this needs n8n Cloud or a self-hosted n8n with a public URL. A local n8n on `localhost` won't receive events.

## Example

A WhatsApp auto-reply: **Hypersender Trigger** (event `message.any`) → **Hypersender**, WhatsApp Message, Send Text, with Chat ID `{{ $json.data.payload.from }}`.

The [Hypersender blog](https://hypersender.com/en/blog/n8n-whatsapp) has a step-by-step guide that builds the same workflow with n8n's own nodes.

## Resources

- [Hypersender API documentation](https://docs.hypersender.com)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- Support: [support@hypersender.com](mailto:support@hypersender.com)

## Version history

- 0.2.0: Hypersender Trigger, which creates and deletes its own webhook.
- 0.1.0: WhatsApp messages and contacts, SMS, and OTP.

## License

[MIT](LICENSE.md)
