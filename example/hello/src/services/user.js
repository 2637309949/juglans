/**
 * app 句柄需要滞后引用
 */
const app = require('../')
const repo = exports

repo.isManager = async function (username) {
  const { mongoose } = app.injects
  try {
    const User = mongoose.model('User')
    const isManager = await User.isManager(username)
    return isManager
  } catch (error) {
    console.error(error.stack)
    throw error
  }
}
