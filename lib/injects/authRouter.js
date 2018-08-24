
const koaRouter = require('koa-router')
const is = require('is')

/**
 * 构建auth路由
 * @param {Object} rParams
 * @param {Object} param1
 */
module.exports = function (rParams, { login, auth, logout }) {
  const router = koaRouter(rParams)
  if (is.function(login) && is.function(auth) && is.function(logout)) {
    router.post('/login', login)
    router.use(auth)
    router.post('/logout', logout)
  }
  return router
}
