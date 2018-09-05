/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-04 09:54:30
 * @modify date 2018-09-04 09:54:30
 * @desc [中间件应用对象]
*/

const koaRouter = require('koa-router')
const koaBody = require('koa-body')
const constants = require('../constants')
const utils = require('../utils')
const is = require('is')

const {authConfig} = utils.getJConfig()

/**
 * 构建路由
 * @param {Object} rParams 路由配置
 * @param {Object} param1  路由配置
 * @param {Object} param2  路由配置
 */
const routerMiddles = function (rParams, { login, auth, logout } = {}, { koaBodyOpts } = {}) {
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
  const middles = [
    bodyParser,
    router.routes(),
    router.allowedMethods()
  ]
  middles.Router = router
  return middles
}

const middle = []
function MiddleContext (params) {
  if (!(this instanceof MiddleContext)) {
    return new MiddleContext(params)
  }
  if (is.array(params) || is.object(params)) {
    this.middle = utils.merge(middle, params)
  } else {
    this.middle = middle
  }
}

/**
 * 获取注入参数
 */
MiddleContext.prototype.getMiddle = function () {
  return this.middle
}

/**
 * 注入参数
 * @param {Object} params 注入对象
 */
MiddleContext.prototype.setMiddle = function (params) {
  if (is.object(params) || is.array(params)) {
    this.middle = utils.merge([], params)
  }
  return this
}

/**
 * 注入参数
 * @param {Object} params 注入对象
 */
MiddleContext.prototype.appendMiddle = function (params) {
  if (is.object(params) || is.array(params)) {
    this.middle = utils.merge(this.middle, params)
  }
  return this
}

/**
 * 获取默认参数
 * @param {Object} rParams1 注入对象1
 * @param {Object} rParams2 注入对象2
 * @param {Object} rParams3 注入对象3
 */
MiddleContext.prototype.getRouterMiddles = function (rParams1, rParams2, rParams3) {
  const middles = routerMiddles(rParams1, rParams2, rParams3)
  return middles
}

module.exports = MiddleContext
