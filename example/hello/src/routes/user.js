/**
 * @param {Object} router
 */
const userServices = require('../services/user')

module.exports = function ({ mongoose, router, test }) {
  router.get('/test', (ctx, next) => {
    ctx.body = ctx.state.user || 'debug'
  })

  router.get('/hello', (ctx, next) => {
    ctx.body = 'hello:' + test
  })

  router.get('/user/aux/manager', async (ctx) => {
    try {
      let username = ctx.query.username
      username = username || ctx.request.body.username
      const isManager = await userServices.isManager({mongoose}, username)
      ctx.body = {data: isManager}
    } catch (error) {
      console.error(error.stack)
      ctx.body = { errcode: 500, errmsg: error.message }
    }
  })
}
