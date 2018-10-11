/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-01 10:56:13
 * @modify date 2018-09-01 10:56:13
 * @desc [Juglans对象]
*/
const EventEmitter = require('events').EventEmitter
const util = require('util')
const handle = require('./handle')
const consts = require('./consts')

/**
 * Julans构造器
 * @param {Object} params 配置参数
 */
function Juglans (params) {
  handle.createHandles(params, this)
  handle.setHandleDepts(this)
}
util.inherits(Juglans, EventEmitter)

/**
 * 配置应用
 * @param {Object} params App参数
 */
Juglans.prototype.setConfig = function (params) {
  this.ConfigContext.appendConfig(params)
  return this
}

/**
 * 注入参数
 * @param {Object} param 注入参数
 */
Juglans.prototype.inject = function (params) {
  this.InjectContext.appendInject(params)
  return this
}

/**
 * 中间件
 * @param {Object} param 中间件参数
 */
Juglans.prototype.middle = function (params) {
  this.MiddleContext.appendMiddle(params)
  return this
}

/**
 * 注册MONGOOSE
 * @param {Function} func 回调函数
 */
Juglans.prototype.mongo = function (func) {
  this.DBContext.mongo(func)
  return this
}

/**
 * 注册REDIS
 * @param {Function} func 回调函数
 */
Juglans.prototype.redis = function (func) {
  this.DBContext.redis(func)
  return this
}

/**
 * 认证插件
 * @param {Function} func 回调函数
 */
Juglans.prototype.auth = function (func) {
  this.AuthContext.setLoginCheck(func)
  return this
}

/**
 * 注册存储
 * @param {Function} func 回调函数
 */
Juglans.prototype.store = function (func) {
  this.ModelContext.setStoreFunc(func)
  return this
}

/**
 * 注册context
 * @param {Function} func 回调函数
 */
Juglans.prototype.context = function (func) {
  this.ExecContext.setContext(func)
  return this
}

/**
 * RUN APP
 * @param {Function} func 回调函数
 */
Juglans.prototype.run = function (cb) {
  this.ExecContext.execute(cb)
  return this
}

/**
 * Juglans事件常量
 */
Juglans.event = consts.event

module.exports = Juglans