const Juglans = require('juglans')
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

/**
 * AccessToken 模型
 * @param {Object} mongoose
 * @param {Object} router
 */
module.exports = function ({ mongoose, schedule }) {
  const name = 'AccessToken'
  mongoose.model(name, defineSchema)
  schedule.scheduleJob('5 * * * * *', async function () {
    // 从数据库中去判断是否能运行该TASK
    const cond = false
    if (!cond) return
    console.log('The answer to life, the universe, and everything!')
  })
}
