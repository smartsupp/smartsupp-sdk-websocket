import * as helpers from '../support/helpers'

describe('client', () => {
	let server
	let client

	beforeAll(() => {
		server = helpers.createServer()
		client = helpers.createClient()
	})

	beforeEach(() => {
		client.removeAllListeners()
	})

	test('should connect to server', (done) => {
		expect.assertions(5)

		client.on('connect', () => {
			expect(client.isConnected()).toBe(true)
		})

		expect(client.isConnected()).toBe(false)
		client.connect().then((data) => {
			expect(client.isConnected()).toBe(true)
			expect(client.isInitialized()).toBe(true)
			expect(data.serverVersion).toBeDefined()
			done()
		})
	})

	test('should disconnect from server', (done) => {
		expect.assertions(4)

		client.on('disconnect', (reason) => {
			expect(reason).toBe('io client disconnect')
			expect(client.isConnected()).toBe(false)
		})

		expect(client.isConnected()).toBe(true)
		client.disconnect().then(() => {
			expect(client.isConnected()).toBe(false)
			done()
		})
	})

	test('should re-connect to server', (done) => {
		expect.assertions(5)

		client.on('connect', () => {
			expect(client.isConnected()).toBe(true)
		})

		expect(client.isConnected()).toBe(false)
		client.connect().then((data) => {
			expect(client.isConnected()).toBe(true)
			expect(client.isInitialized()).toBe(true)
			expect(data.serverVersion).toBeDefined()
			done()
		})
	})

	test('should again disconnect from server', (done) => {
		expect.assertions(4)

		client.on('disconnect', (reason) => {
			expect(reason).toBe('io client disconnect')
			expect(client.isConnected()).toBe(false)
		})

		expect(client.isConnected()).toBe(true)
		client.disconnect().then(() => {
			expect(client.isConnected()).toBe(false)
			done()
		})
	})

	afterAll(async () => {
		server.close()
	})
})
