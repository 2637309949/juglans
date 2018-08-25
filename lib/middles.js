const koaRouter = require('koa-router')
const koaBody = require('koa-body')
const is = require('is')

const utils = require('./utils')
const {koaBodyDefultOpts} = require('./constants')

const {authConfig} = utils.getJConfig()
module.exports = function (rParams, { login, auth, logout }, { koaBodyOpts }) {
  const router = koaRouter(rParams)

  console.log(login)
  if (is.function(login) &&
    is.function(auth) &&
    is.function(logout)) {
    router.post(authConfig.loginPath, login)
    router.use(auth)
    router.post(authConfig.logoutPath, logout)
  }
  const bodyParser = koaBody(koaBodyOpts || koaBodyDefultOpts)
  module.exports.Router = router
  return [
    bodyParser,
    router.routes(),
    router.allowedMethods()
  ]
}
