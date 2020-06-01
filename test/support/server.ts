import * as SocketIO from 'socket.io'

const debug = require('debug')('smartsupp:server')

export function createSocketServer(port, options): SocketIO.Server {
	const socketServer = SocketIO(port, options)

	socketServer.on('connection', (socket: any) => {
		debug(`connected ${socket.id}`)

		socket.on('visitor.connect', (data, callback) => {
			debug(`visitor.connect ${socket.id}`)

			socket.initialized = true
			callback(null, {
				serverVersion: 3,
				visitor: {
					id: 'visitor_1',
				},
				account: {
					status: 'online',
					agents: [],
					groups: [],
				},
				chat: null,
			})
		})

		socket.on('chat.message', (data, callback) => {
			if (!socket.initialized) {
				callback({
					message: 'Connection not initialized',
					type: 'auth_error',
					event: 'chat.message',
					code: 403,
				})
			} else {
				callback(null, 'message_id')
			}
		})

		socket.on('disconnect', () => {
			debug(`disconnected ${socket.id}`)
		})
	})

	return socketServer
}
