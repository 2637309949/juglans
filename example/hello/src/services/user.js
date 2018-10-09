
const Juglans = require('juglans')
const mongoose = Juglans.mongoose

const repo = exports
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
