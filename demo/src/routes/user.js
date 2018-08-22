/**
 * @param {Object} router
 */
const userServices = require('../services/user')

module.exports = function ({ mongoose, router, authRouter, utils, test }) {
  /**
   * 测试
   */
  router.get('/hello', (ctx, next) => {
    const cond = ctx.query.sort || '-_created'
    const ret = utils.parseSortStr(cond)
    ctx.body = ret
  })
  /**
   * 测试
   */
  authRouter.get('/hello2', (ctx, next) => {
    ctx.body = 'hello2' + test
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
    }
  })
}
