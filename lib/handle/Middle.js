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

const assign = Object.assign

/**
 * 构建路由
 * @param {Object} rParams 路由配置
 * @param {Object} param1  路由配置
 * @param {Object} param2  路由配置
 */
const routerMiddles = function (config) {
  const {prefix, bodyParser = constants.KOABODYDEFULTOPTS} = config
  const router = koaRouter({prefix})
  const KoaParser = koaBody(bodyParser)
  const baseMiddle = [KoaParser]
  const routerMiddle = [router.routes(), router.allowedMethods()]
  return {
    baseMiddle,
    routerMiddle,
    router
  }
}

const middle = []
const preMiddle = []

function MiddleContext () {
  if (!(this instanceof MiddleContext)) {
    return new MiddleContext()
  }
  this.middle = middle
  this.preMiddle = preMiddle
}

/**
 * 依赖配置
 * @param {Object} param 依赖参数
 */
MiddleContext.prototype.onDepends = function (params) {
  assign(this, params)
}

/**
 * 获取注入参数
 */
MiddleContext.prototype.getMiddle = function () {
  const { baseMiddle, routerMiddle } = this
  return [...baseMiddle, ...this.middle, ...routerMiddle]
}

/**
 * 注入参数
 * @param {Object} params 注入对象
 */
MiddleContext.prototype.setMiddle = function (params) {
  if (is.object(params) || is.array(params)) {
    this.middle = utils.object.deepMerge([], params)
  } else {
    throw new Error('nonsupport!')
  }
  return this
}

/**
 * 注入参数
 * @param {Object} params 注入对象
 */
MiddleContext.prototype.appendMiddle = function (params) {
  if (is.object(params) || is.array(params)) {
    this.middle = utils.object.deepMerge(this.middle, params)
  } else {
    throw new Error('nonsupport!')
  }
  return this
}

/**
 * 获取默认参数
 */
MiddleContext.prototype.prebuildRouter = function () {
  const config = this.ConfigContext.getConfig()
  const {
    baseMiddle,
    routerMiddle,
    router
  } = routerMiddles(config)
  this.baseMiddle = baseMiddle
  this.routerMiddle = routerMiddle
  this.InjectContext.appendInject({ router })
  return routerMiddle
}

module.exports = MiddleContext
