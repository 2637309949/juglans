const koaRouter = require('koa-router')

module.exports = function (params) {
  const router = koaRouter(params)
  return router
}
