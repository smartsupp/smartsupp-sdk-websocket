# Getting started


## Install

```sh
npm install --save smartsupp-websocket
yarn add smartsupp-websocket
```

We use [socket.io](https://github.com/socketio/socket.io-client) as websocket engine.


## Setup

Create visitor client with your __SMARTSUPP_ACCOUNT_KEY__. 
You can find this key in smartsupp guides "Insert chat code to website".

```ts
import { createVisitorClient } from 'smartsupp-websocket'

const client = createVisitorClient({
    data: {
        id: null, // or id returned from server
        key: '__SMARTSUPP_ACCOUNT_KEY__',
        // ...
    },
})
```

When your client is connecting from **non-browser environment** you must setup extra headers: 

```ts
const client = createVisitorClient({
    connection: {
        options: {
            extraHeaders: {
                'user-agent': '<user_agent_of_visitor>',
                'x-forwarded-for': '<ip_of_visitor>',
            },
        },
    },
})
```

When client is initialized you can connect to server

```ts
websocketClient.connect().then((data) => {
    console.log(data)
}).catch((err) => {
    console.log(err)
})
```


## Options

Required:
- `key` Smartsupp account key to identify account.
- `id` Visitor id, default `null` and should be set by last connect data.
- `visits` Num of visits, default is `null` and should by last connect data.

Optional user info:
- `name` Name of visitor, maximum length of 255 chars.
- `email` Email of visitor, maximum length of 255 chars, must be matchable by client.EMAIL_REGEX.
- `phone` Phone of visitor, maximum length of 50 chars.
- `lang` User language, if omitted detected automatically.
- `group` Group of visitor, must be created in smartsupp settings, default `null` .
- `variables` Additional data (context) related to chat (Key-value object). Values will be displayed in dashboard for agents.

Optional browsing info:
- `pageUrl` Page url, default `window.document.location.toString()`
- `pageTitle` Page title, default `window.document.title`
- `referer` Page referer, default `window.document.referrer`
- `domain` Page domain, default `window.document.domain`
