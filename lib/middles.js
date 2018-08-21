const koaRouter = require('koa-router')
const koaBody = require('koa-body')
const authR = require('./injects/authRouter')

module.exports = function (rParams, rRouter) {
  const router = koaRouter(rParams)
  const authRouter = authR(rParams, rRouter)
  const bodyParser = koaBody({
    strict: false,
    jsonLimit: '5mb',
    formLimit: '1mb',
    textLimit: '1mb',
    multipart: true
  })

  module.exports.Router = router
  module.exports.authRouter = authRouter
  return [
    bodyParser,
    authRouter.routes(), authRouter.allowedMethods(),
    router.routes(), router.allowedMethods()
  ]
}
