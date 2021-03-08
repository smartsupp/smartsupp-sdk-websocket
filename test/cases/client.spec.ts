import * as helpers from '../support/helpers'

describe('client', () => {
	let server
	let client

	beforeAll(async () => {
		server = await helpers.createServer()
		client = helpers.createClient()
	})

	beforeEach(() => {
		client.removeAllListeners()
	})

	test('should connect to server', () => {
		expect.assertions(5)

		client.on('connect', () => {
			expect(client.isConnected()).toBe(true)
		})

		expect(client.isConnected()).toBe(false)
		return client.connect().then((data) => {
			expect(client.isConnected()).toBe(true)
			expect(client.isInitialized()).toBe(true)
			expect(data.serverVersion).toBeDefined()
			return
		})
	})

	test('should disconnect from server', () => {
		expect.assertions(4)

		client.on('disconnect', (reason) => {
			expect(reason).toBe('io client disconnect')
			expect(client.isConnected()).toBe(false)
		})

		expect(client.isConnected()).toBe(true)
		return client.disconnect().then(() => {
			expect(client.isConnected()).toBe(false)
			return
		})
	})

	test('should re-connect to server', () => {
		expect.assertions(5)

		client.on('connect', () => {
			expect(client.isConnected()).toBe(true)
		})

		expect(client.isConnected()).toBe(false)
		return client.connect().then((data) => {
			expect(client.isConnected()).toBe(true)
			expect(client.isInitialized()).toBe(true)
			expect(data.serverVersion).toBeDefined()
			return
		})
	})

	test('should again disconnect from server', () => {
		expect.assertions(4)

		client.on('disconnect', (reason) => {
			expect(reason).toBe('io client disconnect')
			expect(client.isConnected()).toBe(false)
		})

		expect(client.isConnected()).toBe(true)
		return client.disconnect().then(() => {
			expect(client.isConnected()).toBe(false)
			return
		})
	})

	afterAll(async () => {
		await server.close()
	})
})
