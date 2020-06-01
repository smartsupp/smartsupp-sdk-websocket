import { SocketError } from './utils'
import { VisitorClient, VisitorClientOptions } from './visitor'

export { SocketError }
export * from './visitor'
export * from './types'
export * from './events'

export let PromiseImpl = Promise

export function createVisitorClient(options: VisitorClientOptions): VisitorClient {
	return new VisitorClient(options)
}

export function setPromiseLibrary(promiseImpl: any) {
	PromiseImpl = promiseImpl
}
