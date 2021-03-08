import { EventEmitter } from 'events'
import { Agent, AgentStatus } from './types'

export class SocketError extends Error {
	code: number
	type: string
	event: string

	constructor(message) {
		super(message)
		Object.setPrototypeOf(this, SocketError.prototype) // fix err instanceOf
		this.name = this.constructor.name
	}
}

export function createError(data: any = null): SocketError {
	const error = new SocketError(data.message)
	if (data.hasOwnProperty('code')) {
		error.code = data.code
	}
	if (data.hasOwnProperty('type')) {
		error.type = data.type
	}
	if (data.hasOwnProperty('event')) {
		error.event = data.event
	}
	if (data.stack) {
		error.stack = `${error.stack}\nCaused By: ${data.stack}`
	}
	return error
}

export function bound(scope, name) {
	return (...args) => {
		scope[name].apply(scope, args) // eslint-disable-line prefer-spread
	}
}

export function createCallback(resolve, reject): any {
	return (err, ret) => {
		if (err) {
			reject(createError(err))
		} else {
			resolve(ret)
		}
	}
}

export function createEmitter(emitter: EventEmitter, name: string) {
	return (data) => {
		emitter.emit(name, data)
	}
}

export function getAgentsBestStatus(agents: Agent[]): AgentStatus {
	for (const agent of agents) {
		if (agent.status === AgentStatus.Online) {
			return AgentStatus.Online
		}
	}
	return AgentStatus.Offline
}

export function assign(target, source): any {
	for (const prop in source) {
		target[prop] = source[prop]
	}
	return target
}
