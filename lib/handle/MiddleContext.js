/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-04 09:54:30
 * @modify date 2018-09-04 09:54:30
 * @desc [中间件应用对象]
*/

const koaRouter = require('koa-router')
const koaBody = require('koa-body')
const constants = require('../consts')
const utils = require('../utils')
const is = require('is')

/**
 * 构建路由
 * @param {Object} rParams 路由配置
 * @param {Object} param1  路由配置
 * @param {Object} param2  路由配置
 */
const routerMiddles = function (config, { login, auth, logout } = {}) {
  const {prefix, authConfig, koaBodyOpts = constants.KOABODYDEFULTOPTS} = config
  const router = koaRouter({prefix})
  if (login && auth && logout) {
    router.post(authConfig.login, login)
    router.use(auth)
    router.post(authConfig.logout, logout)
  }
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

function MiddleContext () {
  if (!(this instanceof MiddleContext)) {
    return new MiddleContext()
  }
  this.middle = middle
}

MiddleContext.prototype.onDepends = function ({MiddleContext, AuthContext, ConfigContext, DBContext, ExecContext, InjectContext, ModelContext}) {
  this.AuthContext = AuthContext
  this.ConfigContext = ConfigContext
  this.DBContext = DBContext
  this.ExecContext = ExecContext
  this.InjectContext = InjectContext
  this.ModelContext = ModelContext
  this.MiddleContext = MiddleContext
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
    this.middle = utils.deepMerge([], params)
  }
  return this
}

/**
 * 注入参数
 * @param {Object} params 注入对象
 */
MiddleContext.prototype.appendMiddle = function (params) {
  if (is.object(params) || is.array(params)) {
    this.middle = utils.deepMerge(this.middle, params)
  }
  return this
}

/**
 * 获取默认参数
 */
MiddleContext.prototype.buildRouterMiddles = function () {
  const config = this.ConfigContext.getConfig()
  const login = this.AuthContext.login()
  const logout = this.AuthContext.logout()
  const auth = this.AuthContext.auth()
  const middles = routerMiddles(config, {login, auth, logout})
  const router = middles.Router

  this.appendMiddle(middles)
  this.InjectContext.appendInject({ router })
  return middles
}

module.exports = MiddleContext
