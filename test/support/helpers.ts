import * as getPort from 'get-port'
import * as SocketIO from 'socket.io'
import * as smartsuppWebsocket from '../../src/index'
import { createSocketServer } from './server'

let LISTEN_PORT

export async function createServer(): Promise<SocketIO.Server> {
	LISTEN_PORT = await getPort()
	return createSocketServer(LISTEN_PORT, {
		path: '/socket',
	})
}

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
