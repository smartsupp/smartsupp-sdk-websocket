import * as SocketIO from 'socket.io'
import * as smartsuppWebsocket from '../../src/index'
import { createSocketServer } from './server'

const LISTEN_PORT = process.env.PORT || '8999'

export function createClient(options: any = {}): smartsuppWebsocket.VisitorClient {
	return smartsuppWebsocket.createVisitorClient({
		connection: {
			url: `http://localhost:${LISTEN_PORT}`,
			options: {
				path: '/socket',
				forceNew: true,
				reconnection: false,
				...options,
			},
		},
		data: {} as any,
	})
}

export function createServer(): SocketIO.Server {
	return createSocketServer(LISTEN_PORT, {
		path: '/socket',
	})
}
