# Official Smartsupp websocket SDK for JavaScript


## Installation

```bash
npm install --save smartsupp-websocket
yarn add smartsupp-websocket
```

- We use [socket.io](https://github.com/socketio/socket.io-client) as websocket engine.
- Documentation can be found on the [Gihub Pages](https://smartsupp.github.io/smartsupp-sdk-websocket/).


## Usage

Create and initialize websocket client and connect to the server.

```js
import { createVisitorClient } from 'smartsupp-websocket'

const client = createVisitorClient({
    data: {
        id: null, // null or id returned from server
        key: '__SMARTSUPP_ACCOUNT_KEY__',
        // ...
    },
})

// connect to server
client.connect().then((data) => {
    console.log(data)
})

// received events
client.on('chat.message_received', (message) => {
    console.log(message)
})
```


## Custom Promise Library

Customize promise library:

```js
import * as smartsuppWebsocket from 'smartsupp-websocket'
smartsuppWebsocket.setPromiseLibrary(Promise)
```


## Development

VuePress docs hot reload workaround:

```bash
make init NPMRC_FILE=~/.npmrc
npx npm-force-resolutions
npm install
```
