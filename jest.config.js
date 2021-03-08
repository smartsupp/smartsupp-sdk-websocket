// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
	testEnvironment: 'node',
	testPathIgnorePatterns: [
		'<rootDir>/node_modules/',
	],
	testRegex: [
		'(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
	],
	transform: {
		'^.+\\.ts?$': 'ts-jest',
	},
}
