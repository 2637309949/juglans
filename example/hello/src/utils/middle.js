/**
 * 注入插件
 */
const serve = require('koa-static')
const moment = require('moment')
const path = require('path')
const Juglans = require('../../../..')
const mongoose = Juglans.mongoose

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
      const object = {
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
      const desc = {}
      if (desc[`${object.requestMethod} ${object.requestUrl}`]) {
        object.requestDesc = desc[`${object.requestMethod} ${object.requestUrl}`]
      }
      if (object.requestUrl.startsWith('/api')) {
        await SystemLog.create([object])
        logInfo = `${moment().format('YYYY-MM-DD HH:mm:ss')} Log: ${user.username} ${user.id}, ${object.requestMethod} ${object.requestUrl} ${object.requestDesc}`
      }
    } else {
      logInfo = `${moment().format('YYYY-MM-DD HH:mm:ss')} Log (unauthorized): ${ctx.req.method.toUpperCase()} ${ctx.request.url}`
    }
    console.log(`<-- ${logInfo}`)
    await next()
    const end = Date.now()
    const delta = end - start
    const status = ctx.status || 404
    const timeDelta = delta < 10000 ? delta + 'ms' : Math.round(delta / 1000) + 's'
    console.log(`--> ${logInfo} ${status} ${timeDelta}`)
  } catch (err) {
    throw err
  }
}

module.exports = [
  logs,
  serve(path.join(__dirname, '../assets/public'))
]
