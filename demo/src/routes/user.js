/**
 * @param {Object} router
 */
module.exports = function ({ router, authRouter, utils }) {
  router.get('/hello', (ctx, next) => {
    const cond = ctx.query.sort || '-_created'
    const ret = utils.parseSortStr({ str: cond })
    ctx.body = ret
  })

  authRouter.get('/hello2', (ctx, next) => {
    ctx.body = 'hello2'
  })
}
