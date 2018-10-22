const Juglans = require('juglans')
const CommonFields = require('../CommonFields')
const mongoose = Juglans.mongoose
const Schema = mongoose.Schema

const defineSchema = new Schema(Object.assign({}, CommonFields, {
  name_sc: {
    type: String,
    displayName: '菜单名称'
  },
  name_tc: {
    type: String,
    displayName: '繁体名称'
  },
  name_en: {
    type: String,
    displayName: '英文名称'
  },
  uri: {
    type: String,
    displayName: '菜单地址'
  },
  icon: {
    type: String,
    displayName: '菜单图标'
  },
  parent: {
    type: String,
    ref: 'Menu',
    displayName: '父级菜单'
  },
  is_active: {
    type: Boolean,
    displayName: '是否启用',
    default: true
  },
  is_out: {
    type: Boolean,
    displayName: '是否外链',
    default: false
  },
  permission_code: {
    type: String,
    displayName: '权限编码'
  },
  order: {
    type: Number,
    displayName: '显示顺序'
  }
}))

mongoose.model('Menu', defineSchema)

/**
 * Schema 模型
 * 方便后期寻址
 */
module.exports.defineSchema = defineSchema
