const koaRouter = require('koa-router')

module.exports = function ({ prefix }) {
  const router = koaRouter({ prefix })
  module.exports.Router = router
  return [router.routes(), router.allowedMethods()]
}
