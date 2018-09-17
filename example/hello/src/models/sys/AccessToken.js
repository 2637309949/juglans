const Juglans = require('../../../../..')
const CommonFields = require('../CommonFields')
const mongoose = Juglans.mongoose
const Schema = mongoose.Schema

const defineSchema = new Schema(Object.assign({}, CommonFields, {
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
}))

defineSchema.set('autoIndex', false)
mongoose.model('AccessToken', defineSchema)
