/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-09 16:55:19
 * @modify date 2019-01-09 16:55:19
 * @desc [user identity]
 */
const assert = require('assert').strict
const moment = require('moment')
const is = require('is')
const utils = require('../utils')

/**
 * skip some spec route or token
 */
async function fakeVerify (reqPath, { fakeTokens, fakeUrls, accessToken }) {
  const fakeTokensIndex = fakeTokens.findIndex(x => x === accessToken)
  const fakeUrlsIndex = fakeUrls.findIndex(x => {
    if (is.regexp(x) && x.test(reqPath)) {
      return true
    } else if (is.string(x) && x === reqPath) {
      return true
    } else {
      return false
    }
  })
  return {
    isFakeTokens: fakeTokensIndex !== -1,
    isFakeUrls: fakeUrlsIndex !== -1
  }
}

/**
 * Identity contructor
 */
module.exports = function Identity ({ auth, expiresIn = 24, fakeUrls = [], fakeTokens = [], route = { obtainToken: '/obtainToken', revokeToken: '/revokeToken', refleshToken: '/refleshToken' }, store: { saveToken, revokeToken, findToken } = {} }) {
  if (!(this instanceof Identity)) {
    return new Identity({ auth, expiresIn, fakeUrls, fakeTokens, route, store: { saveToken, revokeToken, findToken } })
  }
  assert.ok(is.function(revokeToken), 'revokeToken can not be empty!')
  assert.ok(is.function(findToken), 'findToken can not be empty!')
  assert.ok(is.function(saveToken), 'saveToken can not be empty!')
  assert.ok(is.number(expiresIn), 'expiresIn can not be empty!')
  assert.ok(is.function(auth), 'auth can not be empty!')
  assert.ok(is.array(fakeTokens), 'fakeTokens should be array!')
  assert.ok(is.array(fakeUrls), 'fakeUrls should be array!')
  this.options = { auth, expiresIn, fakeUrls, fakeTokens, route, saveToken, revokeToken, findToken }
}

/**
 * get data after auth by iden plugin
 */
module.exports.getAccessData = async function (ctx) {
  return ctx.state.accessData
}

/**
 * set data after auth by iden plugin
 */
async function setAccessData (ctx, data) {
  ctx.state.accessData = data
}

/**
 * get data after auth by iden plugin
 */
module.exports.getAccessToken = async function (ctx) {
  return ctx.state.accessToken
}

/**
 * set data after auth by iden plugin
 */
async function setAccessToken (ctx, accessToken) {
  ctx.state.accessToken = accessToken
}

/**
 * obtainToken user request and gen token and save token
 */
module.exports.prototype.obtainToken = async function (data) {
  const { expiresIn, saveToken } = this.options
  const accessToken = utils.randomStr(32)
  const refreshToken = utils.randomStr(32)
  const created = moment().unix()
  const updated = moment().unix()
  const expired = moment().add(expiresIn, 'hour').unix()
  await saveToken({
    accessToken,
    refreshToken,
    created,
    updated,
    expired,
    extra: data
  })
  return {
    accessToken,
    refreshToken,
    created,
    updated,
    expired,
    extra: data
  }
}

/**
 * auth request token
 */
module.exports.prototype.authToken = async function (ctx, accessToken) {
  const { findToken } = this.options
  const token = await findToken(accessToken)
  const now = moment().unix()
  if (!token) {
    return false
  } else if (now > token.expired) {
    return false
  } else {
    return true
  }
}

module.exports.prototype.plugin = function () {
  const { auth, expiresIn, fakeUrls, fakeTokens, route, saveToken, revokeToken, findToken } = this.options
  const obtainToken = this.obtainToken.bind(this)
  const authToken = this.authToken.bind(this)
  return async function ({ router, config }) {
    /**
     * parse token from user request
     */
    router.use(async function (ctx, next) {
      const body = ctx.request.body
      const accessToken = ctx.query['accessToken'] ||
          body['accessToken'] ||
          ctx.cookies.get('accessToken') ||
          ctx.get('Authorization') ||
          ctx.get('accessToken')
      await setAccessToken(ctx, accessToken)
      await next()
    })

    /**
     * obtain token
     */
    router.post(route.obtainToken, async function (ctx) {
      try {
        const ret = await auth(ctx)
        if (ret) {
          const data = await obtainToken(ret)
          ctx.body = {
            errcode: null,
            errmsg: null,
            data
          }
        } else {
          ctx.body = { errcode: 500, errmsg: 'user authentication failed!' }
        }
      } catch (error) {
        console.error(error)
        ctx.body = { errcode: 500, errmsg: error.message }
      }
    })

    /**
     * revoke token
     */
    router.post(route.revokeToken, async function (ctx) {
      try {
        const accessToken = await module.exports.getAccessToken(ctx)
        await revokeToken(accessToken)
        ctx.body = {
          errcode: null,
          errmsg: null,
          data: 'ok'
        }
      } catch (error) {
        console.error(error)
        ctx.body = {
          errcode: 500,
          errmsg: error.message
        }
      }
    })

    /**
     * reflesh token
     */
    router.post(route.refleshToken, async function (ctx) {
      try {
        const accessToken = await module.exports.getAccessToken(ctx)
        const data = await findToken(accessToken)
        if (!data) {
          ctx.body = {
            errcode: null,
            errmsg: null,
            data: 'refleshToken invalid'
          }
        } else {
          // 重建token
          await revokeToken(accessToken)
          data.accessToken = utils.randomStr(32)
          data.updated = moment().unix()
          data.expired = moment().add(expiresIn, 'hour').unix()
          await saveToken(data)
          ctx.body = {
            errcode: null,
            errmsg: null,
            data
          }
        }
      } catch (error) {
        console.error(error)
        ctx.body = {
          errcode: 500,
          errmsg: error.message
        }
      }
    })

    /**
     * auth token
     */
    router.use(async function (ctx, next) {
      try {
        const accessToken = await module.exports.getAccessToken(ctx)
        const { isFakeTokens, isFakeUrls } = await fakeVerify(ctx.path, { fakeTokens, fakeUrls, accessToken })
        if (isFakeUrls) {
          ctx.state.fakeUrl = true
          await next()
        } else if (isFakeTokens) {
          ctx.state.fakeToken = true
          await next()
        } else {
          const ret = await authToken(accessToken)
          if (!ret) {
            ctx.body = { errcode: 500, errmsg: 'invalid token' }
          } else {
            const token = await findToken(accessToken)
            await setAccessData(ctx, token.extra)
            await next()
          }
        }
      } catch (error) {
        ctx.body = { errcode: 500, errmsg: error.message }
      }
    })
  }
}
