import { Client, ClientOptions } from './client'
import { Events } from './events'
import { ChatRateInitResult, ChatReadInfo, ChatStatus, ChatUnreadInfo, ChatUploadInitResult, PromiseImpl, Properties, Rating, Visitor } from './index'
import { AccountStatus, Agent, AuthenticateResult, Group, Message } from './types'
import * as utils from './utils'
import { createCallback, SocketError } from './utils'

const emitEvents = [
	'account.updated',
	'agent.status_updated',
	'agent.removed',
	'chat.agent_joined',
	'chat.agent_assigned',
	'chat.agent_unassigned',
	'chat.agent_left',
	'chat.closed',
	'chat.message_received',
	'chat.agent_typing',
	'chat.rated',
	'chat.contact_read',
	'chat.deleted',
]

const identityProperties = [
	'id', 'name', 'email', 'chatId', 'variables', 'lang', 'group', 'bannedAt', 'triggerable', 'visits',
]

const readonlyProperties = [
	'bannedAt', 'chatId', 'status',
]

export class VisitorClient extends Client {
	serverVersion: number = null
	identity: Visitor | null
	connectData: ConnectOptions

	private updatedValues: any = {}

	constructor(options: VisitorClientOptions) {
		super(options.connection)
		this.connectData = options.data
		this.identity = null // initialized after first connect to server

		for (const event of emitEvents) {
			this.connection.on(event, utils.createEmitter(this, event))
		}

		this.connection.on('server.error', utils.bound(this, 'onServerError'))
		this.connection.on('visitor.updated', utils.bound(this, 'onVisitorUpdated'))
	}

	//
	// Events
	//

	on(event: 'initialized', listener: (data: ConnectedData) => void): this
	on(event: 'account.updated', listener: (data: Events.AccountUpdated) => void): this
	on(event: 'agent.status_updated', listener: (data: Events.AgentStatusUpdated) => void): this
	on(event: 'agent.removed', listener: (data: Events.AgentRemoved) => void): this
	on(event: 'visitor.updated', listener: (values: Partial<Visitor>) => void): this
	on(event: 'chat.rated', listener: (data: Events.ChatRated) => void): this
	on(event: 'chat.message_received', listener: (data: Events.ChatMessageReceived) => void): this
	on(event: 'chat.closed', listener: (data: Events.ChatClosed) => void): this
	on(event: 'chat.agent_typing', listener: (data: Events.ChatAgentTyping) => void): this
	on(event: 'chat.agent_joined', listener: (data: Events.ChatAgentJoined) => void): this
	on(event: 'chat.agent_assigned', listener: (data: Events.ChatAgentAssigned) => void): this
	on(event: 'chat.agent_unassigned', listener: (data: Events.ChatAgentUnassigned) => void): this
	on(event: 'chat.agent_left', listener: (data: Events.ChatAgentLeft) => void): this
	on(event: 'chat.contact_read', listener: (data: Events.ChatRead) => void): this
	on(event: 'chat.deleted', listener: (data: Events.ChatDeleted) => void): this
	on(event: 'error', listener: (err: Error | SocketError) => void): this
	on(event: string, listener: (...args: any[]) => void): this
	on(event: string, listener: (...args: any[]) => void): this {
		super.on(event, listener)
		return this
	}

	getId(): string | null {
		return this.identity ? this.identity.id : null
	}

	getIdentity(): Visitor | null {
		return this.identity
	}

	connect(): Promise<ConnectedData> {
		return super.connect()
	}

	//
	// API methods
	//

	update(values: UpdateOptions = {}) {
		this.checkServerVersion()
		for (const name in values) {
			this.identity[name] = values[name]
			this.updatedValues[name] = values[name]
		}
		this.saveVisitorValues()
	}

	authenticate(values: any): Promise<AuthenticateResult> {
		this.checkServerVersion()
		return new PromiseImpl((resolve, reject) => {
			this.send('visitor.authenticate', {
				values,
			}, createCallback(resolve, reject))
		})
	}

	notify(name: string, value: string): Promise<void> {
		this.checkServerVersion()
		return new PromiseImpl((resolve, reject) => {
			this.send('visitor.notify', {
				name,
				value,
			}, createCallback(resolve, reject))
		})
	}

	chatRead() {
		this.checkServerVersion()
		this.send('chat.read', null)
	}

	chatTyping(is: boolean, text: string = null) {
		this.checkServerVersion()
		this.send('chat.typing', {
			typing: { is, text },
		})
	}

	chatMessage(options: MessageOptions): Promise<Message> {
		this.checkServerVersion()
		return new PromiseImpl((resolve, reject) => {
			this.send('chat.message', options, createCallback(resolve, reject))
		})
	}

	chatClose(type: string = null) {
		this.checkServerVersion()
		this.send('chat.close', {
			type,
		})
	}

	chatUploadInit(): Promise<ChatUploadInitResult> {
		this.checkServerVersion()
		return new PromiseImpl((resolve, reject) => {
			this.send('chat.upload_init', null, createCallback(resolve, reject))
		})
	}

	chatUploadFinish(uploadToken: string): Promise<Message> {
		this.checkServerVersion()
		return new PromiseImpl((resolve, reject) => {
			this.send('chat.upload_finish', {
				uploadToken,
			}, createCallback(resolve, reject))
		})
	}

	chatTranscript(email: string, lang: string): Promise<void> {
		this.checkServerVersion()
		return new PromiseImpl((resolve, reject) => {
			this.send('chat.transcript', {
				email,
				lang,
			}, createCallback(resolve, reject))
		})
	}

	chatRateInit(): Promise<ChatRateInitResult> {
		this.checkServerVersion()
		return new PromiseImpl((resolve, reject) => {
			this.send('chat.rate_init', null, createCallback(resolve, reject))
		})
	}

	chatRate(options: RatingOptions): Promise<void> {
		this.checkServerVersion()
		return new PromiseImpl((resolve, reject) => {
			this.send('chat.rate', options, createCallback(resolve, reject))
		})
	}

	visitorConnect(): Promise<ConnectedData> {
		const values = {
			...this.connectData,
		}

		for (const key in this.updatedValues) {
			values[key] = this.updatedValues[key]
		}
		this.updatedValues = {}

		if (this.identity) {
			for (const key in this.identity) {
				if (readonlyProperties.indexOf(key) < 0) { // filter out read-only props
					values[key] = this.identity[key]
				}
			}
		}

		this.emit('initialize', values)

		return new PromiseImpl((resolve, reject) => {
			this.connection.emit('visitor.connect', values, createCallback(resolve, reject))
		})
	}

	visitorDisconnect(): Promise<void> {
		return new PromiseImpl((resolve, reject) => {
			this.connection.emit('visitor.disconnect', {}, createCallback(resolve, reject))
		})
	}

	//
	// Event handlers
	//

	private onVisitorUpdated(data: Events.VisitorUpdated) {
		const changes = {}
		for (const name in data.changes) {
			if (identityProperties.indexOf(name) >= 0) {
				if (this.identity) {
					this.identity[name] = data.changes[name]
				}
				changes[name] = data.changes[name]
			}
		}
		if (Object.getOwnPropertyNames(changes).length > 0) {
			this.emit('visitor.updated', changes)
		}
	}

	private onServerError(data: Events.ServerError) {
		const err = utils.createError(data)
		this.emit('error', err)
	}

	//
	// Utils, data formatting
	//

	protected initialize(): Promise<ConnectedData> {
		return this.visitorConnect().then((data: ConnectedData) => {
			this.serverVersion = data.serverVersion
			this.identity = data.visitor
			return data
		})
	}

	private saveVisitorValues() {
		if (!this.initialized) {
			return // update only if initialized
		}
		setTimeout(() => {
			if (!this.initialized || (Object.getOwnPropertyNames(this.updatedValues).length === 0)) {
				return
			}
			const values = {}
			for (const key in this.updatedValues) {
				values[key] = this.updatedValues[key]
			}
			this.send('visitor.update', { values })
			this.updatedValues = {}
		}, 1)
	}

	private checkServerVersion() {
		if (this.serverVersion === null) {
			throw new Error('Client not yet connected to server')
		}
	}
}

export interface VisitorClientOptions {
	data: ConnectOptions
	connection: ClientOptions
}

export interface ConnectOptions {
	id: string | null
	key: string
	group?: string | null
	email?: string | null
	name?: string | null
	phone?: string | null
	lang?: string | null
	referer?: string | null
	domain?: string | null
	pageUrl?: string | null
	pageTitle?: string | null
	bundleVersion?: string
	visits?: number
	createdAt?: number
	variables?: Properties
	properties?: Properties
}

export interface MessageOptions {
	content: {
		type: string
		text?: string
		data?: any
	}
	isOffline?: boolean
}

export interface RatingOptions {
	messageId: string
	value?: number
	text?: string
}

export interface UpdateOptions {
	name?: string
	email?: string
	lang?: string
	group?: string | null
	variables?: Properties
	properties?: Properties
}

export interface ConnectedData {
	serverVersion?: number
	visitor: Visitor
	browser: BrowserInfo | null
	account: AccountInfo
	chat?: ChatInfo
}

export interface BrowserInfo {
	isMobile: boolean
	isTablet: boolean
	isDesktop: boolean
	isSmartTV: boolean
	isIE: boolean
	isEdge: boolean
}

export interface AccountInfo {
	status: AccountStatus
	agents: Agent[]
	groups: Group[]
}

export interface ChatInfo {
	id: string
	assignedIds: string[] | null
	rating: Rating | null
	status: ChatStatus
	readInfo: ChatReadInfo
	unreadInfo: ChatUnreadInfo
	messages: Array<Message>
}

