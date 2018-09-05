/**
 * @author [Double]
 * @email [example@mail.com]
 * @create date 2018-09-01 11:19:21
 * @modify date 2018-09-01 11:19:21
 * @desc [中间件]
*/
const koaRouter = require('koa-router')
const koaBody = require('koa-body')
const is = require('is')

const utils = require('./utils')
const constants = require('./constants')

const {authConfig} = utils.getJConfig()

/**
 * 构建路由
 * @param {Object} rParams 路由配置
 * @param {Object} param1  路由配置
 * @param {Object} param2  路由配置
 */
module.exports = function (rParams, { login, auth, logout } = {}, { koaBodyOpts } = {}) {
  const router = koaRouter(rParams)
  if (is.function(login) &&
    is.function(auth) &&
    is.function(logout)) {
    router.post(authConfig.loginPath, login)
    router.use(auth)
    router.post(authConfig.logoutPath, logout)
  }
  koaBodyOpts = koaBodyOpts || constants.KOABODYDEFULTOPTS
  const bodyParser = koaBody(koaBodyOpts)
  module.exports.Router = router
  return [
    bodyParser,
    router.routes(),
    router.allowedMethods()
  ]
}
