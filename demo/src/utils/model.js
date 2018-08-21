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
    find: null,
    delete: null
  }
}

module.exports = ({config, mongoose}) => {
  const token = tokenMoel(config, mongoose)
  return {
    token
  }
}
