/**
 * 注册model
 * @param {Object} config
 * @param {Object} mongoose
 */
const tokenMoel = (config, mongoose) => {
  const Token = mongoose.model('Token')
  return {
    save: async function (item) {
      return Token.create([item])
    },
    find: async function (accessToken) {
      return Token.findOne({ accessToken, _dr: false })
    },
    delete: async function (accessToken) {
      return Token.updateOne({ accessToken, _dr: false }, { $set: { _dr: true } })
    }
  }
}

module.exports = ({config, mongoose}) => {
  const token = tokenMoel(config, mongoose)
  return {
    token
  }
}
