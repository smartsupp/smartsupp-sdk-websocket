export enum AccountStatus {
	Online = 'online',
	Offline = 'offline',
}

export enum MessageType {
	Message = 'message',
	Event = 'event',
}

export enum MessageSubType {
	Agent = 'agent',
	Contact = 'contact',
	Trigger = 'trigger',
	System = 'system',
}

export enum AttachmentType {
	Image = 'image',
	File = 'file',
}

export interface Visitor {
	id: string
	chatId: string | null
	lang: string | null
	name: string | null
	email: string | null
	phone: string | null
	bannedAt: string | null
	group: string | null
	visits: number
	variables: Properties
}

export interface MessageChannel {
	type: string
	id: string | null
}

export interface IMessage {
	id: string
	type: MessageType
	subType: MessageSubType
	channel: MessageChannel
	chatId: string
	groupId: string | null
	visitorId: string
	agentId: string | null
	trigger: { id: string, name: string } | null
	createdAt: string
	content: IContent
	tags: string[] | null
	responseTime: number | null
	attachments: Attachment[]
}

export interface IContent {
	type: string
	text: string | null
	data: any | null
}

export interface Attachment {
	type: AttachmentType
	fileName: string
	fileType: string
	url: string
	expireAt: string
	size: number
	width: number | null
	height: number | null
	thumb400?: Thumb
}

export interface Thumb {
	url: string
	expireAt: string
	width: number
	height: number
}

// Message (Normal) - Content

export namespace MessageContent {
	export enum Type {
		Text = 'text',
		Upload = 'upload',
		RateForm = 'rate_form'
	}

	export interface IContent {
		type: Type
		text: string | null
		data: any | null
	}

	export interface Text extends IContent {
		type: Type.Text
		text: string
		data: any | null
	}

	export interface Upload extends IContent {
		type: Type.Upload
		data: Attachment
	}

	export interface RateForm extends IContent {
		type: Type.RateForm
		data: {
			value: number
			text: string
		}
	}

	export type Content =
		| Text
		| Upload
		| RateForm
}


export interface MessageGeneric<T1 extends MessageSubType, T2 extends MessageContent.Content> extends IMessage {
	type: MessageType.Message
	subType: T1
	content: T2
}

export interface MessageAgent extends IMessage {
	type: MessageType.Message
	subType: MessageSubType.Agent
	content: MessageContent.Content
}

export interface MessageVisitor extends IMessage {
	type: MessageType.Message
	subType: MessageSubType.Contact
	content: MessageContent.Content
}

export interface MessageTrigger extends IMessage {
	type: MessageType.Message
	subType: MessageSubType.Trigger
	content: MessageContent.Content
}

export interface MessageSystem extends IMessage {
	type: MessageType.Message
	subType: MessageSubType.System
	content: MessageContent.Content
}

// Message Event - Content

export namespace MessageEventContent {
	export enum Type {
		AgentJoin = 'agent_join',
		AgentLeave = 'agent_leave',
		AgentAssign = 'agent_assign',
		AgentUnassign = 'agent_unassign',
		ChatClose = 'chat_close',
	}

	export interface IContent {
		type: Type
		text: string | null
		data: any | null
	}

	export interface AgentJoin extends IContent {
		type: Type.AgentJoin
		data: {
			agentId: string
		}
	}

	export interface AgentLeave extends IContent {
		type: Type.AgentLeave
		data: {
			agentId: string
		}
	}

	export interface AgentAssign extends IContent {
		type: Type.AgentAssign
		data: {
			assigned: string
			assignedBy: string
		}
	}

	export interface AgentUnassign extends IContent {
		type: Type.AgentUnassign
		data: {
			unassigned: string
			unassignedBy: string
		}
	}

	export interface ChatClose extends IContent {
		type: Type.ChatClose
		data: {
			closeType: 'visitor_close' | 'agent_close' | string
			agentId?: string // only when closeType is agent_close
		}
	}

	export type Content =
		| AgentJoin
		| AgentLeave
		| AgentAssign
		| AgentUnassign
		| ChatClose
}

export interface MessageEventGeneric<T1 extends MessageSubType, T2 extends MessageEventContent.Content> extends IMessage {
	type: MessageType.Event
	subType: T1
	content: T2
}

export interface MessageEventSystem extends IMessage {
	type: MessageType.Event
	subType: MessageSubType.System
	content: MessageEventContent.Content
}

// Message

export type Message =
	| MessageAgent
	| MessageVisitor
	| MessageTrigger
	| MessageSystem
	| MessageEventSystem


// Other objects

export interface ChatUnreadInfo {
	type: ChatReadType
	count: number
	lastReadAt: string | null
}

export interface ChatReadInfo {
	type: ChatReadType
	lastReadAt: string | null
}

export enum ChatReadType {
	Agent = 'agent',
	Visitor = 'visitor',
}

export enum AgentStatus {
	Online = 'online',
	Offline = 'offline',
}

export enum ChatStatus {
	Pending = 'pending',
	Open = 'open',
	Closed = 'closed',
}

export interface Agent {
	id: string
	status: AgentStatus
	groups: string[]
	nickname: string
	fullname: string
	description: string
	avatar: string
}

export interface Group {
	key: string
	name: string
}

export interface Rating {
	value: number
	text: string | null
}

export interface Properties {
	[key: string]: string | number | boolean
}

export interface AuthenticateResult {
	email: string | null
	name?: string | null
	phone?: string | null
	group?: string | null
	variables: Properties & {
		authenticated: boolean
	}
}

export interface ChatUploadInitResult {
	url: string
	token: string
}

export interface ChatRateInitResult {
	message: MessageGeneric<MessageSubType.System, MessageContent.RateForm>
}
