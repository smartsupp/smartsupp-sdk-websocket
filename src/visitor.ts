import { Client, ClientOptions } from './client'
import { Events } from './events'
import { ChatRateInitResult, ChatReadInfo, ChatStatus, ChatUnreadInfo, ChatUploadInitResult, PromiseImpl, Properties, Rating, Visitor } from './index'
import { AccountStatus, Agent, AuthenticateResult, Group, Message } from './types'
import * as utils from './utils'
import { assign, createCallback, getAgentsBestStatus, SocketError } from './utils'

const emitEvents = [
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
	accountStatus: AccountStatus = AccountStatus.Offline
	agents: Agent[] = []
	groups: Group[] = []
	chatAssignedIds: string[] = []

	private updatedValues: any = {}

	constructor(options: VisitorClientOptions) {
		super(options.connection)
		this.connectData = {
			pageUrl: typeof window !== 'undefined' ? window.document.location.toString() : null,
			pageTitle: typeof window !== 'undefined' ? window.document.title : null,
			referer: typeof window !== 'undefined' ? window.document.referrer : null,
			domain: typeof window !== 'undefined' ? window.document.domain : null,
			bundleVersion: '${BUNDLE_VERSION}', // replaced before publish
			...options.data,
		}
		this.identity = null // initialized after first connect to server

		for (const event of emitEvents) {
			this.connection.on(event, utils.createEmitter(this, event))
		}
		this.connection.on('server.error', utils.bound(this, 'onServerError'))
		this.connection.on('account.updated', utils.bound(this, 'onAccountUpdated'))
		this.connection.on('agent.updated', utils.bound(this, 'onAgentUpdated'))
		this.connection.on('agent.removed', utils.bound(this, 'onAgentRemoved'))
		this.connection.on('visitor.updated', utils.bound(this, 'onVisitorUpdated'))
		this.connection.on('chat.agent_joined', utils.bound(this, 'onChatAgentJoined'))
		this.connection.on('chat.agent_left', utils.bound(this, 'onChatAgentLeft'))
		this.connection.on('chat.agent_assigned', utils.bound(this, 'onChatAgentAssigned'))
		this.connection.on('chat.agent_unassigned', utils.bound(this, 'onChatAgentUnassigned'))
	}

	//
	// Events
	//

	on(event: 'initialized', listener: (data: ConnectedData) => void): this
	on(event: 'account.status_updated', listener: (status: AccountStatus) => void): this
	on(event: 'group.updated', listener: (group: Group) => void): this
	on(event: 'agent.updated', listener: (data: Events.AgentUpdated) => void): this
	on(event: 'agent.removed', listener: (data: Events.AgentRemoved) => void): this
	on(event: 'visitor.updated', listener: (values: Partial<Visitor>) => void): this
	on(event: 'chat.rated', listener: (data: Events.ChatRated) => void): this
	on(event: 'chat.message_received', listener: (data: Events.ChatMessageReceived) => void): this
	on(event: 'chat.closed', listener: (data: Events.ChatClosed) => void): this
	on(event: 'chat.agent_typing', listener: (data: Events.ChatAgentTyping) => void): this
	on(event: 'chat.agent_joined', listener: (data: Events.ChatAgentJoined) => void): this
	on(event: 'chat.agent_left', listener: (data: Events.ChatAgentLeft) => void): this
	on(event: 'chat.agent_assigned', listener: (data: Events.ChatAgentAssigned) => void): this
	on(event: 'chat.agent_unassigned', listener: (data: Events.ChatAgentUnassigned) => void): this
	on(event: 'chat.contact_read', listener: (data: Events.ChatRead) => void): this
	on(event: 'chat.deleted', listener: (data: Events.ChatDeleted) => void): this
	on(event: 'error', listener: (err: Error | SocketError) => void): this
	on(event: string, listener: (...args: any[]) => void): this
	on(event: string, listener: (...args: any[]) => void): this {
		super.on(event, listener)
		return this
	}

	//
	// API methods
	//

	connect(): Promise<ConnectedData> {
		return super.connect()
	}

	getAccountStatus(): AccountStatus {
		return this.accountStatus
	}

	getVisitorId(): string | null {
		return this.identity ? this.identity.id : null
	}

	getVisitorIdentity(): Visitor | null {
		return this.identity
	}

	getAgents(): Agent[] {
		return this.agents
	}

	getAgent(id: string): Agent {
		for (const agent of this.agents) {
			if (agent.id === id) {
				return agent
			}
		}
		return null
	}

	getGroups(): Group[] {
		return this.groups
	}

	getGroup(key: string): Group {
		for (const group of this.groups) {
			if (group.key === key) {
				return group
			}
		}
		return null
	}

	getAssignedAgents(): Agent[] {
		return this.chatAssignedIds.map(id => this.getAgent(id))
	}

	updateVisitorIdentity(values: UpdateOptions = {}) {
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

	chatClose(): Promise<void> {
		this.checkServerVersion()
		return new PromiseImpl((resolve, reject) => {
			this.send('chat.close', null, createCallback(resolve, reject))
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
		const values = assign(assign({}, this.connectData), this.updatedValues)
		this.updatedValues = {}
		if (this.identity) {
			for (const key in this.identity) {
				if (readonlyProperties.indexOf(key) < 0) { // filter out read-only props
					values[key] = this.identity[key]
				}
			}
		}
		return new PromiseImpl((resolve, reject) => {
			this.connection.emit('visitor.connect', values, createCallback(resolve, reject))
		})
	}

	//
	// Event handlers
	//

	private onVisitorUpdated(data: Events.VisitorUpdated): void {
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

	private onAccountUpdated(data: Events.AccountUpdated): void {
		if (data.status) {
			this.accountStatus = data.status
			this.emit('account.status_updated', data.status)
		}
		this.emit('account.updated', data)
	}

	private onAgentUpdated(data: Events.AgentUpdated): void {
		for (const agent of this.agents) {
			if (agent.id === data.id) {
				assign(agent, data.changes)
			}
		}
		this.emit('agent.updated', data)
	}

	private onAgentRemoved(data: Events.AgentRemoved): void {
		this.agents = this.agents.filter(agent => agent.id !== data.id)
		this.syncGroupsStatus()
		this.emit('agent.removed', data)
	}

	private onChatAgentJoined(data: Events.ChatAgentJoined): void {
		this.chatAssignedIds.push(data.agent.id)
		this.emit('chat.agent_joined', data)
	}

	private onChatAgentLeft(data: Events.ChatAgentLeft): void {
		this.chatAssignedIds.splice(this.chatAssignedIds.indexOf(data.agent.id), 1)
		this.emit('chat.agent_left', data)
	}

	private onChatAgentAssigned(data: Events.ChatAgentAssigned): void {
		this.chatAssignedIds.push(data.assigned.id)
		this.emit('chat.agent_assigned', data)
	}

	private onChatAgentUnassigned(data: Events.ChatAgentUnassigned): void {
		this.chatAssignedIds.splice(this.chatAssignedIds.indexOf(data.unassigned.id), 1)
		this.emit('chat.agent_unassigned', data)
	}

	private onServerError(data: Events.ServerError): void {
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
			this.accountStatus = data.account.status
			this.agents = data.account.agents
			this.groups = data.account.groups
			this.chatAssignedIds = data.chat ? data.chat.assignedIds : []
			this.syncGroupsStatus()
			return data
		})
	}

	private saveVisitorValues(): void {
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

	private checkServerVersion(): void {
		if (this.serverVersion === null) {
			throw new Error('Client not yet connected to server')
		}
	}

	private syncGroupsStatus(): void {
		for (const group of this.groups) {
			const status = getAgentsBestStatus(this.agents.filter((agent) => {
				return agent.groups.length === 0 || agent.groups.indexOf(group.key) >= 0
			}))
			if (group.status !== status) {
				this.emit('group.updated', group)
			}
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

