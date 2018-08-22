/**
 * 认证插件
 */
const _ = require('lodash')

module.exports = async function auth ({ctx, config, mongoose}) {
  const obj = _.pick(ctx.request.body, 'username', 'password')
  const User = mongoose.model('User')
  let userData = await User.findOne({
    _dr: { $ne: true },
    username: obj.username,
    password: obj.password
  })
  if (userData) {
    return {
      id: userData._id,
      email: userData.email,
      username: userData.username
    }
  } else {
    return null
  }
}
