const resolve = require('path').resolve
const assert = require('assert')
const send = require('koa-send')

module.exports = ({ root, opts }) => async function ({ app, config }) {
  opts = Object.assign({}, opts)
  assert(root, 'root directory is required to serve files')
  opts.root = resolve(root)
  if (opts.index !== false) opts.index = opts.index || 'index.html'
  if (!opts.defer) {
    return app.use(async function (ctx, next) {
      let done = false
      if (ctx.method === 'HEAD' || ctx.method === 'GET') {
        try {
          done = await send(ctx, ctx.path, opts)
        } catch (err) {
          if (err.status !== 404) {
            throw err
          }
        }
      }
      if (!done) {
        await next()
      }
    })
  }
  app.use(async function (ctx, next) {
    await next()
    if (ctx.method !== 'HEAD' && ctx.method !== 'GET') return
    if (ctx.body != null || ctx.status !== 404) return // eslint-disable-line
    try {
      await send(ctx, ctx.path, opts)
    } catch (err) {
      if (err.status !== 404) {
        throw err
      }
    }
  })
}
