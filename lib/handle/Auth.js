/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-04 09:54:30
 * @modify date 2018-09-04 09:54:30
 * @desc [认证参数应用对象]
*/
const moment = require('moment')
const is = require('is')
const utils = require('../utils')
const consts = require('../consts')
const mongoose = require('../mongoose')

const assign = Object.assign
function AuthContext () {
  if (!(this instanceof AuthContext)) {
    return new AuthContext()
  }
}

/**
 * 依赖配置
 * @param {Object} param 依赖参数
 */
AuthContext.prototype.onDepends = function (params) {
  assign(this, params)
}

/**
 * 配置登陆检测
 * @param {Function} func 登陆检测函数
 */
AuthContext.prototype.setLoginCheck = function (func) {
  if (is.function(func)) {
    this.loginCheck = func
  } else {
    throw new Error('nonsupport!')
  }
  return this
}

/**
 * 生成Token
 * @param {Object} data 关联Data
 */
AuthContext.prototype.createToken = async function (data) {
  try {
    const store = this.ModelContext.getTokenStore()
    const security = this.ConfigContext.getConfig().security
    const { expiresIn, secret } = security
    const secretData = utils.genJWT({data, expiresIn, secret})
    const accessToken = utils.genToken()
    const _created = consts.doc._created
    const _expired = moment().add(expiresIn, 'hour').unix()
    const _creator = consts.doc._creator
    await store.save({
      _creator,
      _created,
      _expired,
      secret: secretData,
      accessToken
    })
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
    const security = this.ConfigContext.getConfig().security
    const secret = security.secret
    const store = this.ModelContext.getTokenStore()
    const data = await store.find(token)
    if (!data) return null
    data.secret = utils.parseJWT(data.secret, secret)
    return data
  } catch (error) {
    console.error('find Token error')
    throw error
  }
}

/**
 * 删除Token
 * @param {String} token 令牌
 */
AuthContext.prototype.revokeToken = async function (token) {
  try {
    const store = this.ModelContext.getTokenStore()
    await store.delete(token)
  } catch (error) {
    console.error('Generating Token error')
    throw error
  }
}

/**
 * 登陆
 */
AuthContext.prototype.login = function () {
  const loginCheck = this.loginCheck
  const config = this.ConfigContext.getConfig()
  const createToken = this.createToken.bind(this)
  return (!loginCheck || !createToken) ? null : async function (ctx) {
    try {
      const authData = await loginCheck({ctx, config, mongoose})
      if (authData) {
        const data = await createToken(authData)
        ctx.body = { errcode: null, errmsg: null, data }
      } else {
        ctx.body = { errcode: 500, errmsg: 'user authentication failed!' }
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
  const { security, debug } = this.ConfigContext.getConfig()
  const fakeTokens = security.fakeTokens
  const revokeToken = this.revokeToken.bind(this)
  return async function (ctx, next) {
    try {
      const accessToken = utils.getTokenFromReq(ctx)
      const filtedToken = fakeTokens.filter(x => debug || x !== consts.DEBUGTOKEN)
      const tkIndex = filtedToken.indexOf(accessToken)
      if (tkIndex !== -1) {
        await next()
      } else {
        await revokeToken(accessToken)
        ctx.body = { errcode: null, errmsg: null, data: 'OK' }
      }
    } catch (error) {
      console.error(error)
      ctx.body = { errcode: 500, errmsg: error.message }
    }
  }
}

/**
 * 验证
 */
AuthContext.prototype.auth = function () {
  const findToken = this.findToken.bind(this)
  const {prefix, security} = this.ConfigContext.getConfig()
  let { fakeTokens, fakeUrls } = security
  fakeUrls = fakeUrls.concat([security.login])
  return async function (ctx, next) {
    try {
      const accessToken = utils.getTokenFromReq(ctx)
      const fakeTokensIndex = fakeTokens.findIndex(x => x === accessToken)
      const fakeUrlsIndex = fakeUrls.findIndex(x => {
        const splits = ctx.path.split(prefix)
        const reqPath = splits.length >= 2 ? splits[1] : splits[0]
        if (is.regexp(x) && x.test(reqPath)) {
          return true
        } else if (is.string(x) && x === reqPath) {
          return true
        } else {
          return false
        }
      })

      // 非检测链接
      if (fakeUrlsIndex !== -1) {
        ctx.state.token = {
          fakeUrl: true
        }
        await next()
      // 非检测令牌
      } else if (fakeTokensIndex !== -1) {
        ctx.state.token = {
          fakeToken: true
        }
        await next()
      } else {
        const data = await findToken(accessToken)
        if (!data) {
          ctx.body = { errcode: 500, errmsg: 'invalid token' }
        } else {
          const secret = data.secret
          delete data.secret
          ctx.state.user = secret
          ctx.state.token = data
          await next()
        }
      }
    } catch (error) {
      ctx.body = { errcode: 500, errmsg: error.message }
    }
  }
}

module.exports = AuthContext
