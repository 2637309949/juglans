const koaRouter = require('koa-router')
const authR = require('./injects/authRouter')

module.exports = function ({ prefix }) {
  const router = koaRouter({ prefix })
  const authRouter = authR({ prefix })

  module.exports.Router = router
  module.exports.authRouter = authRouter
  return [
    authRouter.routes(), authRouter.allowedMethods(),
    router.routes(), router.allowedMethods()
  ]
}
