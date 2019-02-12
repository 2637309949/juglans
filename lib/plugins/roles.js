/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-11 17:38:37
 * @modify date 2019-01-11 17:38:37
 * @desc [Roles and Perm detect]
 */
// ### Example:
// app.Use(Roles({
//   async failureHandler(ctx, action){
//     ctx.status = 403
//     ctx.body = {
//       message: 'access Denied, you don\'t have permission.'
//     }
//   },
//   async roleHandler(ctx, action) {
//     const [role, permission] = action.split('@')
//     const accessData = await Identity.getAccessData(ctx)
//     return true
//   }
// }))
const Roles = require('koa-roles')
const assert = require('assert').strict
const is = require('is')

module.exports = ({
  failureHandler = async function (ctx, action) {
    ctx.status = 500
    ctx.body = {
      message: 'access Denied, you don\'t have permission.'
    }
  },
  roleHandler
}) => ({ httpProxy }) => {
  assert.ok(is.function(failureHandler), 'failureHandler can not be empty!')
  assert.ok(is.function(roleHandler), 'roleHandler can not be empty!')
  const roles = new Roles({ failureHandler })
  httpProxy.use(roles.middleware())
  roles.use(roleHandler)
  return { roles }
}
