/**
 * @param {Object} router
 */
module.exports = function ({ router }) {
  router.get('/hello', (ctx, next) => {
    ctx.body = 'hello'
  })
}
