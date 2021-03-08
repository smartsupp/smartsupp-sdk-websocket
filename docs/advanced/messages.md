# Push Messages

With `chatMessage` API call you can import messages as the history of communication with the bot.

Handover of the chat to an agent when a visitor sends a message is the default behaviour.
However, with the flag `preventOpenChat` you can suppress this behaviour.

- when you send bot message set `type: 'bot'`
- when you send visitor message set `preventOpenChat` as `true`
- when you send visitor message and want to notify agents with new chat set `preventOpenChat` as `false`

```typescript
const client = sdk.createVisitorClient({
	...
})

// connect to server
client.connect().then(async () => {
	// add visitor message
	await client.chatMessage({
		type: 'contact',
        content: {
			text: 'Hello',
			type: 'text',
		},
		preventOpenChat: true, // true => don't notify agents
	})

	// add bot message
	await client.chatMessage({
		type: 'bot',
		content: {
			text: 'Bot reply',
			type: 'text',
		},
	})

	// add visitor message (opening chat with agents)
	await client.chatMessage({
		type: 'contact',
		content: {
			text: 'How are you?',
			type: 'text',
		},
		preventOpenChat: false, // false => agets receive new chat notification
	})
})
```
