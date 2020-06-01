# Official Smartsupp websocket SDK for JavaScript


## Installation

To install a SDK, simply add the high-level package, for example:

```bash
npm install --save smartsupp-websocket
yarn add smartsupp-websocket
```

NOTE: We use [socket.io](https://github.com/socketio/socket.io-client) as websocket engine. 
This package is required as peer dependency.


## Usage

Create and initialize websocket client and connect to the server.

```js
import { createVisitorClient } from 'smartsupp-websocket'

const websocketClient = createVisitorClient({
    connection: {
        url: 'https://websocket.smartsupp.com',
        options: {
            path: '/socket',
            forceNew: true,
        },
    },
    data: {
        id: null, // or id returned from server
        key: '__SMARTSUPP_ACCOUNT_KEY__',
        // ...
    },
})

// connect to server
websocketClient.connect().then((data) => {
    console.log(data)
}).catch((err) => {
    console.log(err)
})

// received events
websocketClient.on('chat.message', (message) => {
    console.log(message)
})
```


## Custom Promise Library

Customize promise library:

```js
import * as smartsuppWebsocket from 'smartsupp-websocket'
smartsuppWebsocket.setPromiseLibrary(Promise)
```
