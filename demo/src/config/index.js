const { nodeEnv = 'local' } = process.env
module.exports = require(`./${nodeEnv}`)
