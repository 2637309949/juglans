const koaRouter = require('koa-router')
const koaBody = require('koa-body')
const authR = require('./injects/authRouter')

const koaBodyDefultOpts = {
  strict: false,
  jsonLimit: '5mb',
  formLimit: '1mb',
  textLimit: '1mb',
  multipart: true
}

module.exports = function (rParams, rRouter, { koaBody: koaBodyOpts }) {
  const router = koaRouter(rParams)
  const authRouter = authR(rParams, rRouter)
  const bodyParser = koaBody(koaBodyOpts || koaBodyDefultOpts)
  module.exports.Router = router
  module.exports.authRouter = authRouter
  return [
    bodyParser,
    authRouter.routes(), authRouter.allowedMethods(),
    router.routes(), router.allowedMethods()
  ]
}
