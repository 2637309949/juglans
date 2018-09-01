const is = require('is')
const Redis = require('ioredis')
const _ = require('lodash')

const mongoose = require('./injects/mongoose')
const assist = require('./assist')
const utils = require('./utils')

/**
 * Juglans构建函数
 * @param {Object} params
 */
function Juglans (params) {
  this._initParams(params)
}

/**
 * 配置应用
 * @param {Object} params App参数
 */
Juglans.prototype.setConfig = function (params) {
  if (is.object(params)) {
    this.config = utils.merge(this.config, params)
  }
  return this
}

/**
 * 注入参数
 * @param {Object} param
 */
Juglans.prototype.inject = function (params) {
  const _this = this
  if (is.object(params)) {
    _this.injectParams = utils.merge(_this.injectParams, params)
  }
  return _this
}

/**
 * 中间件
 * @param {Object} param
 */
Juglans.prototype.middle = function (params) {
  const _this = this
  const middles = params && is.array(params) ? params : [params]
  if (middles) {
    _this.middles = utils.merge(_this.middles, middles)
  }
  return _this
}

/**
 * 注册mongoose
 * @param {Function} func 回调函数
 */
Juglans.prototype.mongo = function (func) {
  const _this = this
  const config = _this.config
  if (is.function(func)) {
    func({ mongoose, config })
  }
  return _this
}

/**
 * 注册redis
 * @param {Function} func 回调函数
 */
Juglans.prototype.redis = function (func) {
  const _this = this
  const config = _this.config
  if (is.function(func)) {
    const redis = func({Redis, config})
    _this.injectParams = utils.merge(_this.injectParams, { redis })
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
  if (cb && is.function(cb)) {
    cb = cb.bind(_this)
  } else {
    cb = utils.nullFunc
  }
  // 装配App
  _this._estabApp(cb)
  return _this
}

Object.assign(Juglans.prototype, assist)
module.exports = Juglans
