import { Agent, AgentStatus, IMessage, MessageContent, MessageEventContent, MessageEventGeneric, MessageGeneric, MessageSubType, Rating, Visitor } from './types'

export namespace Events {
	export interface VisitorUpdated {
		id: string
		changes: Partial<Visitor>
	}

	export interface ChatAgentTyping {
		chatId: string
		typing: {
			is: boolean
			text: string | null
		}
	}

	export interface ChatRated {
		chatId: string
		rating: Rating
		message: MessageGeneric<MessageSubType.System, MessageContent.RateForm>
	}

	export interface ChatRead {
		chatId: string
		lastReadAt: string
		byId: string | null
	}

	export interface ChatMessageReceived {
		chatId: string
		message: IMessage
	}

	export interface ChatAgentJoined {
		chatId: string
		agent: Agent
		message: MessageEventGeneric<MessageSubType.System, MessageEventContent.AgentJoin>
	}

	export interface ChatAgentLeft {
		chatId: string
		agent: Agent
		message: MessageEventGeneric<MessageSubType.System, MessageEventContent.AgentLeave>
	}

	export interface ChatAgentAssigned {
		chatId: string
		assigned: Agent
		assignedBy: Agent
		message: MessageEventGeneric<MessageSubType.System, MessageEventContent.AgentAssign>
	}

	export interface ChatAgentUnassigned {
		chatId: string
		unassigned: Agent
		unassignedBy: Agent
		message: MessageEventGeneric<MessageSubType.System, MessageEventContent.AgentUnassign>
	}

	export interface ChatClosed {
		chatId: string
		closeType: string | null
		message: MessageEventGeneric<MessageSubType.System, MessageEventContent.ChatClose>
	}

	export interface ChatDeleted {
		chatId: string
	}

	export interface ServerError {
		message: string
		code?: number
		type?: string
		event?: string
	}

	export interface AgentStatusUpdated {
		id: string
		status: AgentStatus
	}

	export interface AgentRemoved {
		id: string
	}

	export interface AccountUpdated {
		status?: string
	}
}
