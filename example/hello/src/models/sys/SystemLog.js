const Juglans = require('juglans')
const mongoose = Juglans.mongoose
const Schema = mongoose.Schema

// 定义模型结构
const defineSchema = new Schema({
  _created: {
    type: Number,
    displayName: '创建时间',
    remark: 'UNIX时间戳'
  },
  userid: {
    type: String,
    displayName: '用户ID'
  },
  name: {
    type: String,
    displayName: '用户名称'
  },
  ip: {
    type: String,
    displayName: '操作IP'
  },
  requestMethod: {
    type: String,
    displayName: '请求方法'
  },
  requestUrl: {
    type: String,
    displayName: '请求地址'
  },
  requestDesc: {
    type: String,
    displayName: '请求描述'
  },
  requestHeaders: {
    type: Schema.Types.Mixed,
    displayName: '请求头'
  },
  queryStringParams: {
    type: Schema.Types.Mixed,
    displayName: '查询参数'
  },
  requestBody: {
    type: Schema.Types.Mixed,
    displayName: '请求体'
  },
  _remark: {
    type: String,
    displayName: '备注'
  }
})

mongoose.model('SystemLog', defineSchema)

/**
 * Schema 模型
 * 方便后期寻址
 */
module.exports.defineSchema = defineSchema
