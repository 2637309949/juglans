
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
        let result = await AccessToken.findOne({ accessToken, _dr: false })
        result = (result && result.toJSON && result.toJSON()) || result
        return result
      },
      async delete (accessToken) {
        return AccessToken.updateOne({ accessToken, _dr: false }, { $set: { _dr: true } })
      }
    }
  }
}
