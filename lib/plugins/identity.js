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

module.exports = ({ auth, expiresIn, fakeUrls, fakeTokens, store: { saveToken, revokeToken, findToken } }) => async function ({ router, config }) {
  assert.ok(is.function(revokeToken), 'revokeToken can not be empty!')
  assert.ok(is.function(findToken), 'findToken can not be empty!')
  assert.ok(is.function(saveToken), 'saveToken can not be empty!')
  assert.ok(is.string(expiresIn), 'expiresIn can not be empty!')
  assert.ok(is.function(auth), 'auth can not be empty!')
  assert.ok(is.array(fakeTokens) || !is.existy(), 'fakeTokens can not be empty!')
  assert.ok(is.array(fakeUrls) || !is.existy(), 'fakeUrls can not be empty!')

  const security = config.security
  if (security.login && security.logout) {
    router.post(security.login, async function (ctx) {
      try {
        const authData = await auth(ctx)
        if (authData) {
          const accessToken = utils.auth.genToken()
          const created = moment().unix()
          const expired = moment().add(expiresIn, 'hour').unix()
          const creator = 'system'
          const data = {
            accessToken,
            created,
            creator,
            expired,
            data: authData
          }
          await saveToken(data)
          ctx.body = { errcode: null, errmsg: null, data }
        } else {
          ctx.body = { errcode: 500, errmsg: 'user authentication failed!' }
        }
      } catch (error) {
        console.error(error)
        ctx.body = { errcode: 500, errmsg: error.message }
      }
    })
    router.post(security.logout, async function (ctx) {
      try {
        const accessToken = utils.auth.getTokenFromReq(ctx)
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
      try {
        const accessToken = utils.auth.getTokenFromReq(ctx)
        const { isFakeTokens, isFakeUrls } = fakeCheck(ctx, { fakeTokens: fakeTokens, fakeUrls: fakeUrls, accessToken })
        // 非检测链接
        if (isFakeUrls) {
          ctx.state.token = {
            fakeUrl: true
          }
          await next()
          // 非检测令牌
        } else if (isFakeTokens) {
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
    })
  }
}
