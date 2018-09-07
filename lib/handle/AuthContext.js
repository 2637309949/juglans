/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-04 09:54:30
 * @modify date 2018-09-04 09:54:30
 * @desc [认证参数应用对象]
*/
const utils = require('../utils')
const moment = require('moment')
const constants = require('../constants')
const mongoose = require('../mongoose')
const is = require('is')

function AuthContext ({ModelContext, ConfigContext} = {}) {
  if (!(this instanceof AuthContext)) {
    return new AuthContext({ModelContext, ConfigContext})
  }
  this.ModelContext = ModelContext
  this.ConfigContext = ConfigContext
}

AuthContext.prototype.setConfigContext = function (ConfigContext) {
  this.ConfigContext = ConfigContext
  return this
}

AuthContext.prototype.setModelContext = function (ModelContext) {
  this.ModelContext = ModelContext
  return this
}

/**
 * 配置登陆检测
 * @param {Function} func 登陆检测函数
 */
AuthContext.prototype.setLoginCheck = function (func) {
  const _this = this
  if (is.function(func)) {
    _this.loginCheck = func
  }
  return _this
}

/**
 * 返回登陆检测函数
 */
AuthContext.prototype.getLoginCheck = function () {
  const _this = this
  return _this.loginCheck
}

/**
 * 生成Token
 * @param {Object} data 关联Data
 */
AuthContext.prototype.createToken = async function (data) {
  try {
    const _this = this
    const store = _this.ModelContext.getTokenStore()
    const config = _this.ConfigContext.getConfig()
    const { authConfig } = config
    const { tokenExp, jwtSecret } = authConfig
    const secret = utils.genJWT({data, tokenExp, jwtSecret})
    const accessToken = utils.genToken()
    const _created = moment().unix()
    const _expired = moment().add(tokenExp, 'hour').unix()
    const _creator = 'super'
    const item = {
      _creator,
      _created,
      _expired,
      secret,
      accessToken
    }
    await store.save(item)
    return {
      accessToken,
      created: _created,
      expired: _expired,
      creator: _creator,
      data
    }
  } catch (error) {
    console.error('Generating Token error')
    throw error
  }
}

/**
 * 查找Token
 * @param {String} token 令牌
 */
AuthContext.prototype.findToken = async function (token) {
  try {
    const _this = this
    const config = _this.ConfigContext.getConfig()
    const { jwtSecret } = config.authConfig
    const store = _this.ModelContext.getTokenStore()
    let tokenData = await store.find(token)
    tokenData = (tokenData && tokenData.toJSON && tokenData.toJSON()) || tokenData
    if (!tokenData) {
      return null
    }
    tokenData.secret = utils.parseJWT(tokenData.secret, jwtSecret)
    return tokenData
  } catch (error) {
    console.error('Generating Token error')
    throw error
  }
}

/**
 * 删除Token
 * @param {String} token 令牌
 */
AuthContext.prototype.deleteToken = async function (token) {
  try {
    const _this = this
    const store = _this.ModelContext.getTokenStore()
    await store.delete(token)
  } catch (error) {
    console.error('Generating Token error')
    throw error
  }
}

/**
 * 返回登陆函数
 */
AuthContext.prototype.login = function () {
  const _this = this
  const loginCheck = _this.getLoginCheck()
  const config = _this.ConfigContext.getConfig()
  const createToken = _this.createToken.bind(_this)
  if (!loginCheck || !createToken) {
    return null
  }
  return async function (ctx) {
    try {
      const authInfo = await loginCheck({ctx, config, mongoose})
      if (authInfo) {
        const data = await createToken(authInfo)
        ctx.body = { errcode: null, errmsg: null, data }
      } else {
        ctx.body = { errcode: 500, errmsg: 'user authentication failed' }
      }
    } catch (error) {
      console.error(error)
      ctx.body = { errcode: 500, errmsg: error.message }
    }
  }
}

/**
 * 注销
 */
AuthContext.prototype.logout = function () {
  const _this = this
  const config = _this.ConfigContext.getConfig()
  const deleteToken = this.deleteToken.bind(_this)
  if (!deleteToken) {
    return null
  }
  return async function (ctx, next) {
    try {
      const accessToken = utils.getTokenFromReq(ctx)
      const filtedToken = config.fakeTokens.filter(x => config.debug || x !== constants.DEBUGTOKEN)
      const tkIndex = filtedToken.indexOf(accessToken)
      if (tkIndex !== -1) {
        await next()
      } else {
        await deleteToken(accessToken)
        ctx.body = { errcode: null, errmsg: null, data: 'OK' }
      }
    } catch (error) {
      console.error(error)
      ctx.body = { errcode: 500, errmsg: error.message }
    }
  }
}

/**
 * Token验证
 */
AuthContext.prototype.auth = function () {
  const _this = this
  const config = _this.ConfigContext.getConfig()
  const findToken = this.findToken.bind(_this)
  if (!findToken) {
    return null
  }
  return async function (ctx, next) {
    try {
      const accessToken = utils.getTokenFromReq(ctx)
      const fakeTokens = config.fakeTokens
      const fakeUrls = config.fakeUrls
      const prefix = config.prefix
      let reqPath = ctx.path

      const fakeTokensIndex = fakeTokens.findIndex(x => x === accessToken)
      const fakeUrlsIndex = fakeUrls.findIndex(x => {
        const splits = reqPath.split(prefix)
        reqPath = splits.length >= 2 ? splits[1] : splits[0]
        if (is.regexp(x) && x.test(reqPath)) {
          return true
        } else if (is.string(x) && x === reqPath) {
          return true
        } else {
          return false
        }
      })
      // skip token check
      if (fakeTokensIndex !== -1 || fakeUrlsIndex !== -1) {
        await next()
        // check token
      } else {
        const tokenData = await findToken(accessToken)
        if (!tokenData) {
          ctx.body = { errcode: 500, errmsg: 'invalid token' }
        } else {
          ctx.state.user = tokenData
          await next()
        }
      }
    } catch (error) {
      console.error(error)
      ctx.body = { errcode: 500, errmsg: error.message }
    }
  }
}

module.exports = AuthContext
