const is = require('is')
const _ = require('lodash')
const mongoose = require('./mongoose')
const Http = require('./http')
const Middles = require('./middles')
const Injects = require('./injects')
const utils = require('./utils')
const path = require('path')

const configs = utils.readYAML(path.join(__dirname, './config.yaml'))
const coreConfigs = configs.core
const middles = []
/**
 * Juglans Core Instance
 */
function Juglans (params) {
  this.injectParams = Injects
  this.configs = coreConfigs
  this.middles = middles
  if (params && is.object(params)) {
    this.configs = utils.mergeConfig(this.configs, params)
  }
}

/**
 * 配置应用
 * @param {Object} params
 */
Juglans.prototype.setConfig = function (params) {
  if (params && is.object(params)) {
    this.configs = utils.mergeConfig(this.configs, params)
  }
  return this
}

/**
 * 构建KOA实例
 */
Juglans.prototype._estabApp = function () {
  const { port, prefix } = this.configs
  const authFunc = this.authFunc
  let middles = Middles({prefix, authFunc})
  middles = this._estabMiddles(middles)

  const router = Middles.Router
  const authRouter = Middles.authRouter
  this._estabInjectParams({ router, authRouter })
  const app = Http({ port, prefix, middles })
  return app
}

/**
 * 注入参数
 * @param {Object} params
 */
Juglans.prototype._estabInjectParams = function (params) {
  this.injectParams = _.merge(this.injectParams, params)
}

/**
 * 注入中间件
 * @param {Object} middles
 */
Juglans.prototype._estabMiddles = function (middles) {
  this.middles = this.middles.concat(middles)
  return this.middles
}

/**
 * 装配Func
 */
Juglans.prototype._estabFunc = function () {
  const {injectPath} = this.configs
  if (injectPath) {
    const funcs = utils.scanInjectFiles(injectPath,
      { ignore: '**/node_modules/**' }
    )
    funcs.forEach((func) => {
      func(this.injectParams)
    })
  }
}

/**
 * 注入参数
 * @param {Object} param
 */
Juglans.prototype.inject = function (param) {
  if (param) {
    this._estabInjectParams(param)
  }
  return this
}

/**
 * 中间件
 * @param {Object} param
 */
Juglans.prototype.middle = function (param) {
  let middles
  if (is.array(param)) {
    middles = param
  } else if (param) {
    middles = [param]
  }

  if (middles) {
    this._estabMiddles(middles)
  }
  return this
}

/**
 * register mongodb
 */
Juglans.prototype.mongo = function (func) {
  const config = this.configs
  if (is.function(func)) {
    func = func.bind(this)
    func({mongoose, config})
  }
  return this
}

/**
 * 认证插件
 */
Juglans.prototype.auth = function (func) {
  if (is.function(func)) {
    this.authFunc = func
  }
  return this
}

/**
 * RUN App
 */
Juglans.prototype.run = function (cb) {
  if (cb && is.function(cb)) {
    cb = cb.bind(this)
  } else {
    cb = utils.nullFunc
  }
  // 装配App
  const app = this._estabApp(cb)
  app.listen(cb)
  // 注入函数
  this._estabFunc()
  return this
}

module.exports = Juglans
