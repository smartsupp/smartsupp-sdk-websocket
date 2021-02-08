/// <reference types="socket.io-client" />
import { EventEmitter } from 'events'
import { PromiseImpl } from './index'
import { createCallback } from './utils'
import * as socketIo from 'socket.io-client'
const debug = require('debug')('smartsupp:client')

export class Client extends EventEmitter {
	connection: SocketIOClient.Socket
	initialized: boolean = false
	identity: any = null

	private connectCallback: any = null
	private disconnectCallback: any = null
	private sendBuffer: any[]
	private initData: any

	constructor(options: ClientOptions) {
		super()
		this.sendBuffer = []

		if (!options.url) {
			options.url = 'https://websocket-visitors.smartsupp.com'
		}
		if (!options.options) {
			options.options = {}
		}
		if (!options.options.hasOwnProperty('autoConnect')) {
			options.options.autoConnect = false
		}
		if (!options.options.hasOwnProperty('forceNew')) {
			options.options.forceNew = true
		}
		if (!options.options.hasOwnProperty('transports')) {
			options.options.transports = ['websocket']
		}
		if (!options.options.hasOwnProperty('path')) {
			options.options.path = '/socket'
		}
		this.connection = socketIo(options.url, options.options)

		this.connection.on('connect', () => {
			debug('socket was connected')
			this.initialized = false

			this.emit('connect')
			this.initialize().then((data) => {
				debug('socket was initialized')
				this.onInitialized(data)
				if (this.connectCallback) {
					this.connectCallback(null, data)
					this.connectCallback = null
				}
			}).catch((err) => {
				if (this.connectCallback) {
					this.connectCallback(err)
					this.connectCallback = null
				}
			})
		})
		this.connection.on('disconnect', (reason) => {
			debug('socket was disconnected', reason)
			this.initialized = false

			// connection is properly disconnect after some time, before this timeout opening and closing operation are running in same time,
			// cause force connection close error
			setTimeout(() => {
				this.emit('disconnect', reason)
				if (this.disconnectCallback) {
					this.disconnectCallback()
					this.disconnectCallback = null
				}
			}, 100)
		})
	}

	getConnection(): SocketIOClient.Socket {
		return this.connection
	}

	isConnected(): boolean {
		return this.connection.connected
	}

	isInitialized(): boolean {
		return this.initialized
	}

	connect(): Promise<any> {
		return new PromiseImpl((resolve, reject) => {
			if (this.initialized) {
				resolve(this.initData)
			} else {
				debug('starting connecting')
				this.connectCallback = createCallback(resolve, reject)
				this.connection.open()
			}
		})
	}

	disconnect(): Promise<void> {
		return new PromiseImpl((resolve, reject) => {
			if (this.connection.disconnected) {
				resolve()
			} else {
				debug('starting disconnecting')
				this.disconnectCallback = createCallback(resolve, reject)
				this.connection.close()
			}
		})
	}

	protected initialize(): Promise<any> {
		return new PromiseImpl((resolve, reject) => {
			reject(new Error('Not implemented method initialize'))
		})
	}

	protected onInitialized(data: any) {
		if (this.initialized) return
		this.initialized = true
		this.initData = data

		this.emit('initialized', data)

		setTimeout(() => {
			if (this.sendBuffer.length > 0) {
				debug(`sending buffered ${this.sendBuffer.length} events`)
				for (let i = 0; i < this.sendBuffer.length; i++) {
					const packet = this.sendBuffer[i]
					this.connection.emit(packet.name, packet.data, packet.callback)
				}
				this.sendBuffer = []
			}
		}, 1)
	}

	protected send(name, data?: any, callback?: any) {
		if (this.initialized) {
			this.connection.emit(name, data, callback)
		} else {
			this.sendBuffer.push({ name, data, callback })
		}
	}

	//
	// Events
	//

	on(event: 'connect', listener: () => void): this
	on(event: 'disconnect', listener: (reason: string) => void): this
	on(event: 'error', listener: (err: Error) => void): this
	on(event: 'initialized', listener: (data: any) => void): this
	on(event: string, listener: (...args: any[]) => void): this
	on(event: string, listener: (...args: any[]) => void): this {
		super.on(event, listener)
		return this
	}

	once(event: 'connect', listener: () => void): this
	once(event: 'disconnect', listener: (reason: string) => void): this
	once(event: 'error', listener: (err: Error) => void): this
	once(event: 'initialized', listener: (data: any) => void): this
	once(event: string, listener: (...args: any[]) => void): this
	once(event: string, listener: (...args: any[]) => void): this {
		super.once(event, listener)
		return this
	}
}

export interface ClientOptions {
	url?: string
	options?: SocketIOClient.ConnectOpts
}
