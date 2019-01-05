const assert = require('assert').strict
const is = require('is')
const moment = require('moment')

function measure (start, end, ctx) {
  const delta = end - start
  const status = ctx.status || 404
  const timeDelta = delta < 10000 ? delta + 'ms' : Math.round(delta / 1000) + 's'
  return { status, timeDelta, delta }
}

module.exports = ({ record = () => {} }) => async function ({ router, config: { prefix } }) {
  assert.ok(is.function(record), 'record should be func type')
  router.use(async function (ctx, next) {
    try {
      let logInfo
      const start = Date.now()
      const accessData = ctx.state.accessData
      const formatTime = moment().format('YYYY-MM-DD HH:mm:ss')
      const reqForm = {
        ip: ctx.ip,
        accessData,
        reqMethod: ctx.method.toUpperCase(),
        reqUrl: ctx.request.url.toLowerCase(),
        reqHeaders: ctx.headers,
        reqQuery: ctx.query,
        reqBody: ctx.request.body,
        _created: moment().unix(),
        _creator: 'system'
      }
      if (accessData) {
        reqForm.accessData = accessData
        if (reqForm.requestUrl.startsWith(prefix)) {
          logInfo = `${formatTime} [${reqForm.accessData.username}], ${reqForm.reqMethod} ${reqForm.reqUrl}`
          await record(reqForm)
        }
      } else if (ctx.state.fakeToken) {
        logInfo = `${formatTime} [FAKE TOKEN]: ${reqForm.reqMethod} ${reqForm.reqUrl}`
      } else if (ctx.state.fakeUrl) {
        logInfo = `${formatTime} [FAKE URL]: ${reqForm.reqMethod} ${reqForm.reqUrl}`
      } else {
        logInfo = `${formatTime} [UNAUTHORIZED]: ${reqForm.reqMethod} ${reqForm.reqUrl}`
      }
      await next()
      const { timeDelta, status } = measure(start, Date.now(), ctx)
      console.log(`<=> ${logInfo} ${status} ${timeDelta}`)
    } catch (err) {
      throw err
    }
  })
}
