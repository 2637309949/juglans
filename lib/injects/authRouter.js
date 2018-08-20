const koaRouter = require('koa-router')
const is = require('is')
module.exports = function ({ prefix, authFunc }) {
  const router = koaRouter({ prefix })
  if (is.function(authFunc)) {
    router.post('/login', authFunc)
  }
  return router
}
