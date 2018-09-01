/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-01 11:20:56
 * @modify date 2018-09-01 11:20:56
 * @desc [构建HTTP应用]
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
