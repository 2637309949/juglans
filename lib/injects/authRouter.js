const koaRouter = require('koa-router')
const is = require('is')
module.exports = function (rParams, { login, auth, logout }) {
  const router = koaRouter(rParams)
  if (is.function(login) && is.function(auth) && is.function(logout)) {
    router.post('/login', login)
    router.use(auth)
    router.post('/logout', logout)
  }
  return router
}
