/**
 * core 非对外接口
 */
const Http = require('./http')
const Middles = require('./middles')
const moment = require('moment')
const _ = require('lodash')
const utils = require('./utils')
const mongoose = require('./mongoose')
const repo = exports

/**
 * 构建KOA实例
 */
repo._estabApp = function (cb) {
  const _this = this
  const config = _this.config
  let authFunc = _this.authFunc
  let storeFunc = _this.storeFunc
  const injectParams = _this.injectParams
  const { port, prefix, fakeTokens, koaBody, debug } = config
  let middles
  let login
  let auth
  let logout

  if (authFunc) {
    if (storeFunc) {
      login = async function (ctx) {
        try {
          const authInfo = await authFunc({ctx, config, mongoose})
          if (authInfo) {
            const data = await _this._estabGenToken(authInfo)
            ctx.body = { errcode: null, errmsg: null, data }
          } else {
            ctx.body = { errcode: 500, errmsg: '用户认证失败', data: null }
          }
        } catch (error) {
          console.error(error)
          ctx.body = { errcode: 500, errmsg: error.message, data: null }
        }
      }
      logout = async function (ctx, next) {
        try {
          const accessToken = utils.getTokenFromReq(ctx)
          const filtedToken = fakeTokens.filter(x => debug || x !== 'DEBUG')
          const tokenIndex = filtedToken.indexOf(accessToken)
          if (tokenIndex !== -1) {
            await next()
          } else {
            await _this._estabDelToken(accessToken)
            ctx.body = { errcode: null, errmsg: null, data: 'OK' }
          }
        } catch (error) {
          console.error(error)
          ctx.body = { errcode: 500, errmsg: error.message, data: null }
        }
      }
      auth = async function (ctx, next) {
        try {
          const accessToken = utils.getTokenFromReq(ctx)
          const filtedToken = fakeTokens.filter(x => debug || x !== 'DEBUG')
          const tokenIndex = filtedToken.indexOf(accessToken)
          if (tokenIndex !== -1) {
            await next()
          } else {
            const tokenData = await _this._estabFinToken(accessToken)
            if (!tokenData) {
              ctx.body = { errcode: 500, errmsg: '令牌无效', data: null }
            } else {
              ctx.state.user = tokenData
              await next()
            }
          }
        } catch (error) {
          console.error(error)
          ctx.body = { errcode: 500, errmsg: error.message, data: null }
        }
      }
    } else if (authFunc) {
      throw new Error('未注册Model')
    }
  }

  if (login && auth && logout) {
    middles = Middles({prefix}, {login, auth, logout}, { koaBody })
  } else {
    middles = Middles({prefix}, {}, {})
  }

  const router = Middles.Router
  const authRouter = Middles.authRouter

  _this.middles = _this.middles.concat(middles)
  _this.injectParams = _.merge(injectParams, { router, authRouter })

  _this._estabFunc()
  if (_this.storeFunc) {
    _this.model = _this.storeFunc({config, mongoose})
  }

  const app = Http({ port, prefix, middles: _this.middles })
  app.listen(cb)
  _this.injects = _this.injectParams
  return app
}

/**
   * 装配Func
   */
repo._estabFunc = function () {
  const _this = this
  const config = _this.config
  const injectParams = _this.injectParams
  const {injectPath, ignorePath} = config
  if (injectPath) {
    const funcs = utils.scanInjectFiles(injectPath, { ignore: ignorePath })
    funcs.forEach((func) => {
      func(injectParams)
    })
  }
}

/**
   * 生成token
   */
repo._estabGenToken = async function (data) {
  try {
    const _this = this
    const tokenExp = _this.config.tokenExp
    const jwtSecret = _this.config.jwtSecret
    const tokenModel = _this.model.token
    const accessToken = utils.genToken()
    const secret = utils.genJWT({data, tokenExp, jwtSecret})
    const _created = moment().unix()
    const _expired = moment().add(tokenExp, 'hour').unix()
    const _creator = 'system'
    const item = {
      _creator,
      _created,
      _expired,
      secret,
      accessToken
    }
    await tokenModel.save(item)
    return {
      accessToken,
      created: _created,
      expired: _expired,
      creator: _creator,
      extra: data
    }
  } catch (error) {
    console.error('生成Token错误')
    throw error
  }
}

repo._estabFinToken = async function (token) {
  try {
    const _this = this
    const jwtSecret = _this.config.jwtSecret
    const tokenModel = _this.model.token
    let tokenData = await tokenModel.find(token)
    tokenData = (tokenData && tokenData.toJSON && tokenData.toJSON()) || tokenData
    if (!tokenData) {
      return null
    }
    tokenData.secret = utils.parseJWT(tokenData.secret, jwtSecret)
    return tokenData
  } catch (error) {
    console.error('生成Token错误')
    throw error
  }
}

repo._estabDelToken = async function (token) {
  try {
    const _this = this
    const tokenModel = _this.model.token
    await tokenModel.delete(token)
  } catch (error) {
    console.error('生成Token错误')
    throw error
  }
}
