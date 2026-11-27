<p align="center"><img width="307" height="63" src="https://raw.githubusercontent.com/hypersender/n8n-nodes-hypersender/main/art/hy.svg" alt="Hypersender Logo"></p>

<p align="center">
<a href="https://www.npmjs.com/package/n8n-nodes-hypersender"><img src="https://img.shields.io/npm/dt/n8n-nodes-hypersender" alt="Total Downloads"></a>
<a href="https://www.npmjs.com/package/n8n-nodes-hypersender"><img src="https://img.shields.io/npm/v/n8n-nodes-hypersender" alt="Latest Stable Version"></a>
<a href="https://github.com/hypersender/n8n-nodes-hypersender/blob/main/LICENSE.md"><img src="https://img.shields.io/badge/license-MIT-brightgreen.svg" alt="License"></a>
</p>

# Introduction

The official [n8n](https://n8n.io) community node for the Hypersender WhatsApp API, SMS API, and OTP API. Send WhatsApp messages from your own number, send SMS from your own Android phone, send and verify OTP codes, and start workflows when a message arrives, without writing HTTP requests.

It adds two nodes:

- **Hypersender**: every WhatsApp, SMS and OTP action that works with an instance token
- **Hypersender Trigger**: starts a workflow on WhatsApp or SMS events, and creates and deletes its own webhook

# Installation

In n8n, open **Settings → Community Nodes → Install** and enter:

```
n8n-nodes-hypersender
```

Then create a **Hypersender API** credential with the **Instance Type** (WhatsApp or SMS), the **Instance ID**, and the instance's **API Key (Bearer Token)** from the [Hypersender dashboard](https://app.hypersender.com). Create one credential per instance.

A WhatsApp auto-reply is two nodes: **Hypersender Trigger** (event `message.any`) → **Hypersender** (WhatsApp Message → Send Text). Chat ID already points at the sender, so you only type the reply.

# Official Documentation

You can find the official documentation at [Hypersender n8n Documentation](https://docs.hypersender.com/v2/packages-and-sdks/n8n/installation).

- [Actions](https://docs.hypersender.com/v2/packages-and-sdks/n8n/actions): every operation of the Hypersender node
- [Trigger](https://docs.hypersender.com/v2/packages-and-sdks/n8n/trigger): events, automatic webhook setup, and the auto-reply example

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

-   [Hypersender](https://github.com/hypersender)
-   [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
