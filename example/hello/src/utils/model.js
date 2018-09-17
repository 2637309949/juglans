
const Juglans = require('../../../..')
const mongoose = Juglans.mongoose

/**
 * 注册model
 * @param {Object} config
 * @param {Object} mongoose
 */
module.exports = () => {
  const AccessToken = mongoose.model('AccessToken')
  return {
    token: {
      async save (item) {
        return AccessToken.create([item])
      },
      async find (accessToken) {
        return AccessToken.findOne({ accessToken, _dr: false })
      },
      async delete (accessToken) {
        return AccessToken.updateOne({ accessToken, _dr: false }, { $set: { _dr: true } })
      }
    }
  }
}
