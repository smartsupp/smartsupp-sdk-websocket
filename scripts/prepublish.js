const fs = require('fs')
const pkg = require('../package.json')

const file = fs.readFileSync('./lib/visitor.js').toString()
fs.writeFileSync('./lib/visitor.js', file.replace('${BUNDLE_VERSION}', `Websocket SDK ${pkg.version}`))
