/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2018-10-09 14:31:35
 * @modify date 2018-10-09 14:31:35
 * @desc [认证插件]
*/
const _ = require('lodash')

module.exports = async function auth ({ctx, config, mongoose}) {
  const form = _.pick(ctx.request.body, 'username', 'password')
  const User = mongoose.model('User')
  const one = await User.findOne({
    _dr: { $ne: true },
    username: form.username,
    password: form.password
  })
  if (one) {
    return {
      id: one._id,
      email: one.email,
      username: one.username
    }
  } else {
    return null
  }
}
