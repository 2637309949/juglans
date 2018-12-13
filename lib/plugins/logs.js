const assert = require('assert').strict
const is = require('is')
const moment = require('moment')

function measure (start, end, ctx) {
  const delta = end - start
  const status = ctx.status || 404
  const timeDelta = delta < 10000 ? delta + 'ms' : Math.round(delta / 1000) + 's'
  return { status, timeDelta, delta }
}

module.exports = ({ record = () => {} }) => async function ({ router, config }) {
  assert.ok(is.function(record), 'record should be func type')
  router.use(async function (ctx, next) {
    const start = Date.now()
    let logInfo
    try {
      if (ctx.state.accessData) {
        const user = ctx.state.accessData
        const form = {
          created: moment().unix(),
          userid: user._id,
          name: user.username,
          ip: ctx.ip,
          requestMethod: ctx.method.toUpperCase(),
          requestUrl: ctx.request.url.toLowerCase(),
          requestHeaders: ctx.headers,
          queryStringParams: ctx.query,
          requestBody: ctx.request.body
        }
        if (form.requestUrl.startsWith('/api')) {
          logInfo = `${moment().format('YYYY-MM-DD HH:mm:ss')} Log: ${user.username}, ${form.requestMethod} ${form.requestUrl} ${form.requestDesc}`
          await record(form)
        }
      } else if (ctx.state.fakeToken) {
        logInfo = `${moment().format('DD/MM/YYYY HH:mm:ss')} Log (fake token): ${ctx.req.method.toUpperCase()} ${ctx.request.url}`
      } else if (ctx.state.fakeUrl) {
        logInfo = `${moment().format('DD/MM/YYYY HH:mm:ss')} Log (fake url): ${ctx.req.method.toUpperCase()} ${ctx.request.url}`
      } else {
        logInfo = `${moment().format('DD/MM/YYYY HH:mm:ss')} Log (unauthorized): ${ctx.req.method.toUpperCase()} ${ctx.request.url}`
      }
      console.log(`<-- ${logInfo}`)
      await next()
      const { timeDelta, status } = measure(start, Date.now(), ctx)
      console.log(`--> ${logInfo} ${status} ${timeDelta}`)
    } catch (err) {
      throw err
    }
  })
}
