const CommonFields = require('../CommonFields')

const defineSchema = Schema => Object.assign({}, CommonFields, {
  _expired: {
    type: Number,
    displayName: '失效时间',
    remark: 'UNIX时间戳',
    index: true
  },
  secret: {
    type: String,
    displayName: '加密数据'
  },
  accessToken: {
    type: String,
    displayName: '令牌',
    unique: true,
    required: '令牌({PATH})不能为空'
  },
  extra: {
    type: Schema.Types.Mixed,
    displayName: '额外数据'
  }
})

/**
 * Role 模型
 * @param {Object} mongoose
 * @param {Object} router
 */
module.exports = function ({ mongoose, router }) {
  const name = 'Token'
  const Schema = mongoose.Schema
  const schema = new Schema(defineSchema(Schema))
  schema.set('autoIndex', false)
  mongoose.model(name, schema)
}
