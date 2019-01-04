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
      if (accessData) {
        const form = {
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
        if (form.requestUrl.startsWith(prefix)) {
          logInfo = `${moment().format('YYYY-MM-DD HH:mm:ss')} Log: ${form.accessData.username}, ${form.reqMethod} ${form.reqUrl}`
          await record(form)
        }
      } else if (ctx.state.fakeToken) {
        logInfo = `${moment().format('DD/MM/YYYY HH:mm:ss')} Log (fake token): ${ctx.req.method.toUpperCase()} ${ctx.request.url}`
      } else if (ctx.state.fakeUrl) {
        logInfo = `${moment().format('DD/MM/YYYY HH:mm:ss')} Log (fake url): ${ctx.req.method.toUpperCase()} ${ctx.request.url}`
      } else {
        logInfo = `${moment().format('DD/MM/YYYY HH:mm:ss')} Log (unauthorized): ${ctx.req.method.toUpperCase()} ${ctx.request.url}`
      }
      await next()
      const { timeDelta, status } = measure(start, Date.now(), ctx)
      console.log(`<--> ${logInfo} ${status} ${timeDelta}`)
    } catch (err) {
      throw err
    }
  })
}
