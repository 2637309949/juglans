const Juglans = require('juglans')
const CommonFields = require('../CommonFields')
const mongoose = Juglans.mongoose
const Schema = mongoose.Schema

// 定义模型结构
const defineSchema = new Schema(Object.assign({}, CommonFields, {
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
  }
}))

mongoose.model('SystemLog', defineSchema)

/**
 * Schema 模型
 * 方便后期寻址
 */
module.exports.defineSchema = defineSchema
