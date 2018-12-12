const assert = require('assert').strict
const is = require('is')
const moment = require('moment')
const utils = require('../utils')

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

  router.post(route.obtainToken, async function (ctx) {
    try {
      const data = await auth(ctx)
      if (data) {
        const accessToken = utils.auth.genToken()
        const created = moment().unix()
        const expired = moment().add(expiresIn, 'hour').unix()
        const creator = 'system'
        await saveToken({
          accessToken,
          created,
          creator,
          expired,
          data
        })
        ctx.body = {
          errcode: null,
          errmsg: null,
          data: {
            accessToken,
            created,
            creator,
            expired,
            data
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
  router.use(async function (ctx, next) {
    const body = ctx.request.body
    let accessToken = ctx.query['accessToken']
    accessToken = accessToken || body['accessToken']
    accessToken = accessToken || (ctx.get('Authorization') ? ctx.get('Authorization').split(' ').reverse()[0] : null)
    accessToken = accessToken || ctx.get('accessToken')
    accessToken = accessToken || ctx.cookies.get('accessToken')
    ctx.state.accessToken = accessToken
    await next()
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
        if (!token) {
          ctx.body = { errcode: 500, errmsg: 'invalid token' }
        } else {
          ctx.state.accessData = token.data
          await next()
        }
      }
    } catch (error) {
      ctx.body = { errcode: 500, errmsg: error.message }
    }
  })
}
