/**
 * @param {Object} router
 */
const userServices = require('../services/user')

module.exports = function ({ mongoose, router, authRouter, utils, test }) {
  /**
   * 测试
   */
  authRouter.get('/hello', (ctx, next) => {
    ctx.body = 'hello:' + test
  })

  /**
   * check user role
   */
  authRouter.get('/user/aux/manager', async (ctx) => {
    try {
      const username = ctx.query.username || ctx.request.body.username
      const isManager = await userServices.isManager(username)
      ctx.body = {data: isManager}
    } catch (error) {
      console.error(error.stack)
      ctx.body = { errcode: 500, errmsg: error.message, data: null }
    }
  })
}
