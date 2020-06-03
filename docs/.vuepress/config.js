// inspired by:
// https://trilogy.js.org/guide/getting-started.html#install-trilogy

module.exports = {
	base: '/smartsupp-sdk-websocket/',
	title: 'Websocket SDK',
	description: 'Official Smartsupp websocket SDK documentation',
	plugins: [
		'@vuepress/back-to-top',
		'@vuepress/nprogress',
		'vuepress-plugin-smooth-scroll',
	],
	extraWatchFiles: [
		"**/*.md",
		"**/*.vue",
	],
	themeConfig: {
		search: false,
		logo: '/assets/img/logo.svg',
		repo: 'smartsupp/smartsupp-sdk-websocket',
		sidebar: [
			{
				collapsable: false,
				children: [
					'',
					'usage',
				],
			},
		],
	},
}
