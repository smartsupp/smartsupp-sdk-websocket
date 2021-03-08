# Push Messages

With api call `chatMessage` you can import message as history of communication with bot.

Handover chat to agents when visitor sending message is default behaviour.
With flag `preventOpenChat` you can suppress this behaviour.

- when you pushing bot message as bot set `type: 'bot'`
- when you pushing visitor message set `preventOpenChat: true`
- when you pushing visitor message and want handover to agents set `preventOpenChat: false`

```typescript
const client = sdk.createVisitorClient({
	...
})

// connect to server
client.connect().then(async () => {
	// add visitor message
	await client.chatMessage({
		content: {
			text: 'Hello',
			type: 'text',
		},
		preventOpenChat: true, // must be disabled
	})

	// add bot message
	await client.chatMessage({
		content: {
			text: 'Bot reply',
			type: 'text',
		},
		type: 'bot',
	})

	// add visitor message (opening chat with agents)
	await client.chatMessage({
		content: {
			text: 'How are you?',
			type: 'text',
		},
		preventOpenChat: false, // must be enabled
	})
})
```
