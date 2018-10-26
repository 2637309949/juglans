/**
 * 根据开发环境加载配置
 * PKG不支持变量加载, 所以使用属性选择的方式
 */
const { NODE_ENV = 'local' } = process.env
const local = require('./local')
const prod = require('./prod')
const test = require('./test')
const dev = require('./dev')

module.exports = {
  local,
  prod,
  test,
  dev
}[NODE_ENV]
module.exports.NODE_ENV = NODE_ENV
