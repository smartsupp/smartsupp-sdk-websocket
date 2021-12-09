module.exports = {
	extends: '@smartsupp/eslint-config/strict',
	rules: {
		'default-case': 'off',
		'no-dupe-class-members': 'off',
		'guard-for-in': 'off',
		'no-console': 'off',
		'new-cap': 'off',
		'spaced-comment': 'off',
		'@typescript-eslint/no-unsafe-call': 'off',
		'@typescript-eslint/no-unsafe-assignment': 'off',
		'@typescript-eslint/no-unsafe-member-access': 'off',
		'@typescript-eslint/no-unsafe-return': 'off',
		'@typescript-eslint/restrict-template-expressions': 'off',
		'unicorn/filename-case': 'off',
		'unicorn/prefer-includes': 'off',
		'jest/no-test-return-statement': 'off',
	},
	parserOptions: {
		project: './test/tsconfig.json',
	},
}
