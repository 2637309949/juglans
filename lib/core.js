const is = require('is')
const _ = require('lodash')
const moment = require('moment')
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
  const _this = this
  const { port, prefix } = this.configs
  const model = this.model
  let authFunc = this.authFunc
  let auth
  let middles
  if (authFunc && model && model.token) {
    auth = (function (config, mongoose) {
      return async function (ctx) {
        try {
          const user = await authFunc({ctx, config, mongoose})
          if (user) {
            const data = await _this._estabToken(user)
            ctx.body = {
              errcode: null,
              errmsg: null,
              data
            }
          } else {
            ctx.body = { errcode: 500, errmsg: '未找到对应用户信息', data: null }
          }
        } catch (error) {
          ctx.body = { errcode: 500, errmsg: error.message, data: null }
        }
      }
    })(this.configs, mongoose)
  } else if (authFunc) {
    throw new Error('未注册Model')
  }

  if (auth) {
    middles = Middles({prefix, authFunc: auth})
  } else {
    middles = Middles({prefix})
  }
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
 * 生成token
 */
Juglans.prototype._estabToken = async function (data) {
  const token = utils.genToken()
  const secret = utils.genJWT(data)
  const _created = moment().unix()
  const expired = moment().add(24, 'hour').unix()
  const _creator = 'system'
  const tokenInfo = {
    _creator,
    _created,
    secret,
    expired,
    token
  }
  return {
    token,
    created: _created,
    expired,
    creator: _creator,
    extra: data
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
 * 注册存储
 */
Juglans.prototype.store = function (func) {
  const config = this.configs
  if (is.function(func)) {
    const model = func({config, mongoose})
    this.model = model
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
