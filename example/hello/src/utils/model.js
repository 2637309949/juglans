/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2018-10-09 14:31:35
 * @modify date 2018-10-09 14:31:35
 * @desc [存储]
*/
const Juglans = require('juglans')
const mongoose = Juglans.mongoose

/**
 * Token的存储
 */
const TOKEN = {
  async save (item) {
    const AuthToken = mongoose.model('AuthToken')
    return AuthToken.create([item])
  },
  async find (accessToken) {
    const AuthToken = mongoose.model('AuthToken')
    const result = await AuthToken.findOne({ accessToken, _dr: false })
    return result && result._doc
  },
  async delete (accessToken) {
    const AuthToken = mongoose.model('AuthToken')
    return AuthToken.updateOne({ accessToken, _dr: false }, { $set: { _dr: true } })
  }
}

/**
 * 注册model
 * @param {Object} config
 * @param {Object} mongoose
 */
module.exports = {
  TOKEN
}
