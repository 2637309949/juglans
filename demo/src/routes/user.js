/**
 * @param {Object} router
 */
module.exports = function ({ router, authRouter, utils, test }) {
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
}
