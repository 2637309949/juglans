/**
 * 注入插件
 */
const serve = require('koa-static')
const moment = require('moment')
const path = require('path')
const Juglans = require('../../../..')
const mongoose = Juglans.mongoose
const apiDesc = {}

/**
 * 测量时间差
 * @param {Number} start
 * @param {Number} end
 * @param {Object} ctx
 */
function measure (start, end, ctx) {
  const delta = end - start
  const status = ctx.status || 404
  const timeDelta = delta < 10000 ? delta + 'ms' : Math.round(delta / 1000) + 's'
  return { status, timeDelta, delta }
}

/**
 * 日志中间件
 * @param ctx
 * @param next
 * @returns {Promise.<void>}
 */
async function logs (ctx, next) {
  const start = Date.now()
  let logInfo
  const SystemLog = mongoose.model('SystemLog')
  try {
    if (ctx.state.user) {
      const user = ctx.state.user
      const form = {
        _created: moment().unix(),
        userid: user._id,
        name: user.username,
        ip: ctx.ip,
        requestMethod: ctx.method.toUpperCase(),
        requestUrl: ctx.request.url.toLowerCase(),
        requestDesc: '',
        requestHeaders: ctx.headers,
        queryStringParams: ctx.query,
        requestBody: ctx.request.body
      }
      form.requestDesc = apiDesc[`${form.requestMethod} ${form.requestUrl}`]
      if (form.requestUrl.startsWith('/api')) {
        logInfo = `${moment().format('YYYY-MM-DD HH:mm:ss')} Log: ${user.username} ${user.id}, ${form.requestMethod} ${form.requestUrl} ${form.requestDesc}`
        await SystemLog.create([form])
      }
    } else if (ctx.state.token && ctx.state.token.fakeToken) {
      logInfo = `${moment().format('YYYY-MM-DD HH:mm:ss')} Log (fake token): ${ctx.req.method.toUpperCase()} ${ctx.request.url}`
    } else if (ctx.state.token && ctx.state.token.fakeUrl) {
      logInfo = `${moment().format('YYYY-MM-DD HH:mm:ss')} Log (fake url): ${ctx.req.method.toUpperCase()} ${ctx.request.url}`
    } else {
      logInfo = `${moment().format('YYYY-MM-DD HH:mm:ss')} Log (unauthorized): ${ctx.req.method.toUpperCase()} ${ctx.request.url}`
    }
    console.log(`<-- ${logInfo}`)
    await next()
    const { timeDelta, status } = measure(start, Date.now(), ctx)
    console.log(`--> ${logInfo} ${status} ${timeDelta}`)
  } catch (err) {
    throw err
  }
}

module.exports = [
  logs,
  serve(path.join(__dirname, '../assets/public'))
]
