/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-01 10:56:13
 * @modify date 2018-09-01 10:56:13
 * @desc [Juglans对象]
*/
const is = require('is')
const Redis = require('ioredis')

const mongoose = require('./mongoose')
const assist = require('./assist')

function Juglans (params) {
  this._initParams(params)
}

/**
 * 配置应用
 * @param {Object} params App参数
 */
Juglans.prototype.setConfig = function (params) {
  const _this = this
  // 更新配置对象
  _this.ConfigContext.appendConfig(params)
  const config = _this.ConfigContext.getConfig()
  // 更新注入对象
  _this.InjectContext.appendInject({config})
  return this
}

/**
 * 注入参数
 * @param {Object} param 注入参数
 */
Juglans.prototype.inject = function (params) {
  const _this = this
  _this.InjectContext.appendInject(params)
  return _this
}

/**
 * 中间件
 * @param {Object} param 中间件参数
 */
Juglans.prototype.middle = function (params) {
  const _this = this
  _this.MiddleContext.appendMiddle(params)
  return _this
}

/**
 * 注册MONGOOSE
 * @param {Function} func 回调函数
 */
Juglans.prototype.mongo = function (func) {
  const _this = this
  const config = _this.ConfigContext.getConfig()
  if (is.function(func)) {
    func({ mongoose, config })
  }
  return _this
}

/**
 * 注册REDIS
 * @param {Function} func 回调函数
 */
Juglans.prototype.redis = function (func) {
  const _this = this
  const config = _this.ConfigContext.getConfig()
  if (is.function(func)) {
    const redis = func({Redis, config})
    _this.InjectContext.appendInject({ redis })
  }
  return _this
}

/**
 * 认证插件
 * @param {Function} func 回调函数
 */
Juglans.prototype.auth = function (func) {
  const _this = this
  if (is.function(func)) {
    _this.loginCheck = func
  }
  return _this
}

/**
 * 注册存储
 * @param {Function} func 回调函数
 */
Juglans.prototype.store = function (func) {
  const _this = this
  if (is.function(func)) {
    _this.storeFunc = func
  }
  return _this
}

/**
 * RUN APP
 * @param {Function} func 回调函数
 */
Juglans.prototype.run = function (cb) {
  const _this = this
  _this._estabApp(cb)
  return _this
}

// 拷贝辅助函数
Object.assign(Juglans.prototype, assist)
module.exports = Juglans
