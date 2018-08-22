/**
 * 根据开发环境加载配置
 */
const { nodeEnv = 'local' } = process.env
module.exports = require(`./${nodeEnv}`)
module.exports.nodeEnv = nodeEnv
