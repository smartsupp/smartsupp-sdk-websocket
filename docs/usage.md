# API Usage

With the Web SDK your visitors can chat with your agents in realtime.


## Connect 

Before you can use API methods you have to connect to server. 
Always good practice is handle the errors.  

```ts
client.connect().then(() => {
    console.log('client connected')
}).catch((err) => {
    console.log(err) 
})

client.on('initialized', (data) => {
    console.log(data) 
})
```

Once connecting is finished you receive event `initialized`. 
In case of network issues client perform automatic reconnection. 
After every reconnect an event `initialized` is fired with latest data.

::: warning
Since last connect there can be changes in messages, agent may send reply or account status may change. 
You should always refresh your view based on latest data.
:::


## Account Status

Account Status inform you whatever agents are online or not. 
If there is at least one agent online status will be online otherwise offline.

```ts
client.on('initialized', (data) => {
    console.log(data.account.status) // online | offline 
})
``` 

When account status is changed you will be notified by the event `account.status_updated`.

```ts
client.on('account.status_updated', (status) => {
    console.log(status) // online | offline 
})
```


## Send Text Message

To send a message use `client.chatMessage()`.

```ts
client.on('chat.message_received', (data) => {
    console.log(data.message.id === message.id) // true
})

cosnt message = await client.chatMessage({
    content: {
        type: 'text',
        text: 'Hello',
    },
})
```

The message you should append to your messages list (stored after `initialized` event) and update view immediately. 

::: warning
The message will be delivered with some delay by event `chat.message_received`. 
You should ignore this message when you already have it. 
:::


## Send File Message

To send image or file use `client.chatUploadInit()`. Method returns upload info with `token` and `url`. 
This pair you need to make http upload. When upload is finished then call `client.chatUploadFinish(token)`.
In response you get Message object same as when you sending text message.

```ts
client.on('chat.message_received', (data) => {
    console.log(data.message.id === message.id) // true
})

const uploadInfo = await client.chatUploadInit()

const formData = new FormData()
formData.append('file', fs.readFileSync('<path_to_file>'), {
    filename: '<name_of_file>',
})

const uploadRes = await axios.post(uploadInfo.url, formData.getBuffer(), {
    headers: formData.getHeaders(),
    maxContentLength: Infinity,
})

const message = await visitorClient.chatUploadFinish(uploadInfo.token)
```

::: warning
After call chatUploadFinish the message will be delivered with some delay by event `chat.message_received`. 
You should ignore this message when you already have it. 
:::


## Send Typing

Typing indicators allow the visitor or agents to know that the other party is currently typing a message.

To inform the agent that the visitor is currently typing, use `client.chatTyping(true)`.
Similarly, use `client.chatTyping(false)` to inform the agent that the visitor is not typing.

On the other hand, you can be notified if an agent is currently typing by listening to the `chat.agent_typing`.

```ts
client.on('chat.agent_typing', (data) => {
    console.log(data)
})
```


## Read Messages

Last read timestamps allow agents to see at what point has the visitor read up to in the chat conversation. 
In the dashboard agents can see double checkmark indicator.

You can update this timestamp by calling `client.chatRead()` when the visitor interacts with widget.

To receive updates on the visitor's last read timestamp, you can listen to the `chat.contact_read` event:

```ts
client.on('chat.contact_read', (data) => {
    console.log(data)
})
```

This allows you to synchronize unread message counts for the same visitor across multiple tabs.
