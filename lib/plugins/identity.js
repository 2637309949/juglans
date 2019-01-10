/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-09 16:55:19
 * @modify date 2019-01-09 16:55:19
 * @desc [user iden]
 */
const assert = require('assert').strict
const is = require('is')
const moment = require('moment')
const utils = require('../utils')

/**
 * Skip some spec Route or Token
 * @param {*} ctx
 * @param {*} param1
 */
function fakeCheck (ctx, { fakeTokens, fakeUrls, accessToken }) {
  const fakeTokensIndex = fakeTokens.findIndex(x => x === accessToken)
  const fakeUrlsIndex = fakeUrls.findIndex(x => {
    const reqPath = ctx.path
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

module.exports = ({ auth, expiresIn, fakeUrls, fakeTokens, route = {}, store: { saveToken, revokeToken, findToken } = {} }) => async function ({ router, config }) {
  assert.ok(is.function(revokeToken), 'revokeToken can not be empty!')
  assert.ok(is.function(findToken), 'findToken can not be empty!')
  assert.ok(is.function(saveToken), 'saveToken can not be empty!')
  assert.ok(is.number(expiresIn), 'expiresIn can not be empty!')
  assert.ok(is.function(auth), 'auth can not be empty!')
  assert.ok(is.array(fakeTokens) || !is.existy(), 'fakeTokens can not be empty!')
  assert.ok(is.array(fakeUrls) || !is.existy(), 'fakeUrls can not be empty!')

  router.use(async function (ctx, next) {
    const body = ctx.request.body
    let accessToken = ctx.query['accessToken']
    accessToken = accessToken || body['accessToken']
    accessToken = accessToken || ctx.cookies.get('accessToken')
    accessToken = accessToken || (ctx.get('Authorization') ? ctx.get('Authorization').split(' ').reverse()[0] : null)
    accessToken = accessToken || ctx.get('accessToken')
    ctx.state.accessToken = accessToken
    await next()
  })
  router.post(route.obtainToken, async function (ctx) {
    try {
      const data = await auth(ctx)
      if (data) {
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
        ctx.body = {
          errcode: null,
          errmsg: null,
          data: {
            accessToken,
            refreshToken,
            created,
            updated,
            expired,
            extra: data
          }
        }
      } else {
        ctx.body = { errcode: 500, errmsg: 'user authentication failed!' }
      }
    } catch (error) {
      console.error(error)
      ctx.body = { errcode: 500, errmsg: error.message }
    }
  })
  router.post(route.revokeToken, async function (ctx) {
    try {
      const accessToken = ctx.state.accessToken
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
  router.post(route.refleshToken, async function (ctx) {
    try {
      const accessToken = ctx.state.accessToken
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
  router.use(async function (ctx, next) {
    try {
      const accessToken = ctx.state.accessToken
      const { isFakeTokens, isFakeUrls } = fakeCheck(ctx, { fakeTokens, fakeUrls, accessToken })
      // 非检测链接
      if (isFakeUrls) {
        ctx.state.fakeUrl = true
        await next()
        // 非检测令牌
      } else if (isFakeTokens) {
        ctx.state.fakeToken = true
        await next()
      } else {
        const token = await findToken(accessToken)
        const now = moment().unix()
        if (!token) {
          ctx.body = { errcode: 500, errmsg: 'invalid token' }
        } else if (now > token.expired) {
          ctx.body = { errcode: 500, errmsg: 'overdue token' }
        } else {
          ctx.state.accessData = token.extra
          await next()
        }
      }
    } catch (error) {
      ctx.body = { errcode: 500, errmsg: error.message }
    }
  })
}
