/**
 * 构建KOA实例
 */
const Koa = require('koa')

/**
 * @param {Object} middles 中间件
 * @param {String} prefix API前缀
 * @param {Number} port 监听端口
 */
module.exports = function ({ middles = [], prefix, port }) {
  const app = new Koa()
  for (const midd of middles) {
    app.use(midd)
  }

  return {
    listen: function (cb) {
      app.listen(port, cb)
    }
  }
}
