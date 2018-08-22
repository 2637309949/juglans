/**
 * 注册model
 * @param {Object} config
 * @param {Object} mongoose
 */
const tokenMoel = (config, mongoose) => {
  const AccessToken = mongoose.model('AccessToken')
  return {
    save: async function (item) {
      return AccessToken.create([item])
    },
    find: async function (accessToken) {
      return AccessToken.findOne({ accessToken, _dr: false })
    },
    delete: async function (accessToken) {
      return AccessToken.updateOne({ accessToken, _dr: false }, { $set: { _dr: true } })
    }
  }
}

module.exports = ({config, mongoose}) => {
  const token = tokenMoel(config, mongoose)
  return {
    token
  }
}
