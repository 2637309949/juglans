/**
 * 中间件
 */
const koaRouter = require('koa-router')
const koaBody = require('koa-body')
const is = require('is')

const utils = require('./utils')
const {KOABODYDEFULTOPTS} = require('./constants')

const {authConfig} = utils.getJConfig()

/**
 * 构建路由
 * @param {Object} rParams 路由配置
 * @param {Object} param1 路由配置
 * @param {Object} param2 路由配置
 */
module.exports = function (rParams, { login, auth, logout }, { koaBodyOpts }) {
  const router = koaRouter(rParams)
  if (is.function(login) &&
    is.function(auth) &&
    is.function(logout)) {
    router.post(authConfig.loginPath, login)
    router.use(auth)
    router.post(authConfig.logoutPath, logout)
  }
  const bodyParser = koaBody(koaBodyOpts || KOABODYDEFULTOPTS)
  module.exports.Router = router
  return [
    bodyParser,
    router.routes(),
    router.allowedMethods()
  ]
}
