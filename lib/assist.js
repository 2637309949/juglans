/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-01 10:53:28
 * @modify date 2018-09-01 10:53:28
 * @desc [Juglans辅助函数]
*/
const moment = require('moment')
const is = require('is')

const InjectContext = require('./handle/InjectContext')
const ConfigContext = require('./handle/ConfigContext')
const mongoose = require('./mongoose')
const Middles = require('./middles')
const constants = require('./constants')
const utils = require('./utils')
const Http = require('./http')

const repo = exports

/**
 * 用户登陆
 * @param {Object} param0
 */
const loginFunc = ({loginCheck, config, _estabGenToken}) => async function (ctx) {
  try {
    const authInfo = await loginCheck({ctx, config, mongoose})
    if (authInfo) {
      const data = await _estabGenToken(authInfo)
      ctx.body = { errcode: null, errmsg: null, data }
    } else {
      ctx.body = { errcode: 500, errmsg: 'user authentication failed' }
    }
  } catch (error) {
    console.error(error)
    ctx.body = { errcode: 500, errmsg: error.message }
  }
}

/**
 * 用户退出
 * @param {Object} param0
 */
const logoutFunc = ({config, _estabDelToken}) => async function (ctx, next) {
  try {
    const accessToken = utils.getTokenFromReq(ctx)
    const filtedToken = config.fakeTokens.filter(x => config.debug || x !== constants.DEBUGTOKEN)
    const tkIndex = filtedToken.indexOf(accessToken)
    if (tkIndex !== -1) {
      await next()
    } else {
      await _estabDelToken(accessToken)
      ctx.body = { errcode: null, errmsg: null, data: 'OK' }
    }
  } catch (error) {
    console.error(error)
    ctx.body = { errcode: 500, errmsg: error.message }
  }
}

/**
 * Token验证
 * @param {Object} param0
 */
const authFunc = ({config, _estabFinToken}) => async function (ctx, next) {
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
      const tokenData = await _estabFinToken(accessToken)
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

/**
 * 初始化配置
 * @param {Object} params 初始化参数
 */
repo._initParams = function (params) {
  const _this = this
  _this.middles = []

  _this._estabGenToken = _this._estabGenToken.bind(_this)
  _this._estabDelToken = _this._estabDelToken.bind(_this)
  _this._estabFinToken = _this._estabFinToken.bind(_this)

  // ConfigContext
  _this.ConfigContext = ConfigContext(params)
  const config = _this.ConfigContext.getConfig()

  // InjectContext
  _this.InjectContext = InjectContext({ config })
}

/**
 * APP构建
 * @param {Function} cb 回调函数
 */
repo._estabApp = function (cb) {
  const _this = this
  let middles
  const {
    storeFunc,
    loginCheck,
    _estabGenToken,
    _estabDelToken,
    _estabFinToken } = _this

  const config = _this.ConfigContext.getConfig()
  const { port, prefix, koaBodyOpts } = config

  if (loginCheck && !storeFunc) {
    throw new Error('Unregistered Model')
  }
  if (loginCheck && storeFunc) {
    const login = loginFunc({loginCheck, config, _estabGenToken})
    const logout = logoutFunc({config, _estabDelToken})
    const auth = authFunc({config, _estabFinToken})
    middles = Middles({prefix}, {login, auth, logout}, { koaBodyOpts })
  } else {
    middles = Middles({prefix})
  }

  const router = Middles.Router
  _this.middles = _this.middles.concat(middles)

  _this.InjectContext.appendInjects({ router })
  _this.injects = _this.InjectContext.getInjects()

  _this._estabFunc()
  if (is.function(_this.storeFunc)) {
    _this.model = _this.storeFunc({config, mongoose})
  }
  const app = Http({ port, prefix, middles: _this.middles })
  app.listen(cb)
  return app
}

/**
 * 装配Func
 */
repo._estabFunc = function () {
  const _this = this
  const config = _this.ConfigContext.getConfig()
  const injectParams = _this.InjectContext.getInjects()
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
 * @param {Object} data 加密数据
 */
repo._estabGenToken = async function (data) {
  try {
    const _this = this
    const {
      authConfig: {
        tokenExp, jwtSecret
      }
    } = _this.ConfigContext.getConfig()

    const tokenModel = _this.model.token
    const accessToken = utils.genToken()
    const secret = utils.genJWT({data, tokenExp, jwtSecret})
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
    if (!is.function(tokenModel.save)) {
      throw new Error('Unregistered save')
    }
    await tokenModel.save(item)
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
 * 查找Token信息
 * @param {String} token 令牌
 */
repo._estabFinToken = async function (token) {
  try {
    const _this = this
    const config = _this.ConfigContext.getConfig()
    const jwtSecret = config.jwtSecret
    const tokenModel = _this.model.token
    if (!is.function(tokenModel.find)) {
      throw new Error('Unregistered find')
    }
    let tokenData = await tokenModel.find(token)
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
 * 失效Token
 * @param {String} token 令牌
 */
repo._estabDelToken = async function (token) {
  try {
    const _this = this
    const tokenModel = _this.model && _this.model.token
    if (!is.function(tokenModel.delete)) {
      throw new Error('Unregistered delete')
    }
    await tokenModel.delete(token)
  } catch (error) {
    console.error('Generating Token error')
    throw error
  }
}
