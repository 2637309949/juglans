const is = require('is')
const Redis = require('ioredis')
const _ = require('lodash')

const mongoose = require('./mongoose')
const assist = require('./assist')
const {
  mergeObject,
  nullFunc} = require('./utils')

/**
 * Juglans Core Instance
 */
function Juglans (params) {
  this._initParams(params)
}

/**
 * 配置应用
 * @param {Object} params
 */
Juglans.prototype.setConfig = function (params) {
  if (is.object(params)) {
    this.config = mergeObject(this.config, params)
  }
  return this
}

/**
 * 注入参数
 * @param {Object} param
 */
Juglans.prototype.inject = function (param) {
  const _this = this
  const injectParams = _this.injectParams
  if (param) {
    _this.injectParams = _.merge(injectParams, param)
  }
  return _this
}

/**
 * 中间件
 * @param {Object} param
 */
Juglans.prototype.middle = function (param) {
  const _this = this
  let middles
  if (is.array(param)) {
    middles = param
  } else if (param) {
    middles = [param]
  }

  if (middles) {
    _this.middles = _this.middles.concat(middles)
  }
  return _this
}

/**
 * register mongodb
 */
Juglans.prototype.mongo = function (func) {
  const _this = this
  const config = _this.config
  if (is.function(func)) {
    func = func.bind(_this)
    func({mongoose, config})
  }
  return _this
}

/**
 * register redis
 */
Juglans.prototype.redis = function (func) {
  const _this = this
  const config = _this.config
  if (is.function(func)) {
    func = func.bind(_this)
    const redis = func({Redis, config})
    _this.injectParams = _.merge(_this.injectParams, { redis })
  }
  return _this
}

/**
 * 认证插件
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
 */
Juglans.prototype.store = function (func) {
  const _this = this
  if (is.function(func)) {
    _this.storeFunc = func
  }
  return _this
}

/**
 * RUN App
 */
Juglans.prototype.run = function (cb) {
  const _this = this
  if (cb && is.function(cb)) {
    cb = cb.bind(_this)
  } else {
    cb = nullFunc
  }
  // 装配App
  _this._estabApp(cb)
  return _this
}

Object.assign(Juglans.prototype, assist)
module.exports = Juglans
