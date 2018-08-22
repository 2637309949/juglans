const koaRouter = require('koa-router')
const is = require('is')
module.exports = function (rParams, { login, auth, logout }) {
  const router = koaRouter(rParams)
  if (is.function(login) && is.function(auth)) {
    router.post('/login', login)
    router.post('/logout', logout)
    router.all('*', auth)
  }
  return router
}
