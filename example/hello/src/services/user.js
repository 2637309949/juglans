
const Juglans = require('juglans')
const mongoose = Juglans.mongoose

const repo = exports

/**
 * 判断用户角色
 */
repo.isManager = async function (username) {
  try {
    const User = mongoose.model('User')
    const isManager = await User.isManager(username)
    return isManager
  } catch (error) {
    console.error(error.stack)
    throw error
  }
}
