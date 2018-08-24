/**
 * @param {Object} router
 */
const userServices = require('../services/user')

module.exports = function ({ mongoose, router, authRouter, test }) {
  router.get('/test', (ctx, next) => {
    ctx.body = 'test:' + test
  })
  authRouter.get('/hello', (ctx, next) => {
    ctx.body = 'hello:' + test
  })
  authRouter.get('/user/aux/manager', async (ctx) => {
    try {
      const username = ctx.query.username || ctx.request.body.username
      console.log('userServices:', userServices)
      const isManager = await userServices.isManager({mongoose}, username)
      ctx.body = {data: isManager}
    } catch (error) {
      console.error(error.stack)
      ctx.body = { errcode: 500, errmsg: error.message, data: null }
    }
  })
}
