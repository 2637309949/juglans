/**
 * core 非对外接口
 */
const Http = require('./http')
const moment = require('moment')
const _ = require('lodash')
const is = require('is')
const Middles = require('./middles')
const injectParams = require('./injects')
const utils = require('./utils')
const mongoose = require('./injects/mongoose')
const {
  getJConfig,
  mergeObject
} = require('./utils')

const repo = exports
const loginFunc = ({loginCheck, config, _estabGenToken}) => async function (ctx) {
  try {
    const authInfo = await loginCheck({ctx, config, mongoose})
    if (authInfo) {
      const data = await _estabGenToken(authInfo)
      ctx.body = { errcode: null, errmsg: null, data }
    } else {
      ctx.body = { errcode: 500, errmsg: '用户认证失败', data: null }
    }
  } catch (error) {
    console.error(error)
    ctx.body = { errcode: 500, errmsg: error.message, data: null }
  }
}

const logoutFunc = ({config, _estabDelToken}) => async function (ctx, next) {
  try {
    const accessToken = utils.getTokenFromReq(ctx)
    const filtedToken = config.fakeTokens.filter(x => config.debug || x !== 'DEBUG')
    const tokenIndex = filtedToken.indexOf(accessToken)
    if (tokenIndex !== -1) {
      await next()
    } else {
      await _estabDelToken(accessToken)
      ctx.body = { errcode: null, errmsg: null, data: 'OK' }
    }
  } catch (error) {
    console.error(error)
    ctx.body = { errcode: 500, errmsg: error.message, data: null }
  }
}

const authFunc = ({config, _estabFinToken}) => async function (ctx, next) {
  try {
    const accessToken = utils.getTokenFromReq(ctx)
    const filtedToken = config.fakeTokens.filter(x => config.debug || x !== 'DEBUG')
    const tokenIndex = filtedToken.indexOf(accessToken)
    if (tokenIndex !== -1) {
      await next()
    } else {
      const tokenData = await _estabFinToken(accessToken)
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

/**
 * 初始化配置
 * @param {Object} params 初始化参数
 */
repo._initParams = function (params) {
  const _this = this
  _this.injectParams = injectParams
  _this.config = getJConfig()
  _this.middles = []
  if (is.object(params)) {
    _this.config = mergeObject(_this.config, params)
    _this.injectParams = _.merge(injectParams, { config: _this.config })
  }
}

/**
 * APP构建
 * @param {Function} cb 回调函数
 */
repo._estabApp = function (cb) {
  const _this = this
  const config = _this.config
  const _estabGenToken = _this._estabGenToken.bind(_this)
  const _estabDelToken = _this._estabDelToken.bind(_this)
  const _estabFinToken = _this._estabFinToken.bind(_this)

  let loginCheck = _this.loginCheck
  let storeFunc = _this.storeFunc
  const injectParams = _this.injectParams
  const { port, prefix, koaBodyOpts } = config
  let middles

  if (loginCheck && !storeFunc) {
    throw new Error('未注册Model')
  }
  if (loginCheck && storeFunc) {
    const login = loginFunc({loginCheck, config, _estabGenToken})
    const logout = logoutFunc({config, _estabDelToken})
    const auth = authFunc({config, _estabFinToken})
    middles = Middles({prefix}, {login, auth, logout}, { koaBodyOpts })
  } else {
    middles = Middles({prefix}, {}, {})
  }

  const router = Middles.Router
  _this.middles = _this.middles.concat(middles)
  _this.injectParams = _.merge(injectParams, { router })
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
 * @param {Object} loginCheck返回的信息
 */
repo._estabGenToken = async function (data) {
  try {
    const _this = this
    const {
      authConfig: {
        tokenExp, jwtSecret
      }
    } = _this.config
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

/**
 * 查找Token信息
 * @param {String} token 令牌
 */
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

/**
 * 失效Token
 * @param {String} token 令牌
 */
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
