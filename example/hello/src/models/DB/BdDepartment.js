const Juglans = require('juglans')
const CommonFields = require('../CommonFields')
const mongoose = Juglans.mongoose
const Schema = mongoose.Schema

const defineSchema = new Schema(Object.assign({}, CommonFields, {
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    disabled: true,
    displayName: '部门名称',
    required: '部门名称({PATH})不能为空'
  },
  parentid: {
    type: String,
    ref: 'BdDepartment',
    displayName: '父级部门'
  },
  order: {
    type: Number,
    disabled: true,
    displayName: '次序值'
  }
}))

mongoose.model('BdDepartment', defineSchema)

/**
 * Schema 模型
 * 方便后期寻址
 */
module.exports.defineSchema = defineSchema
