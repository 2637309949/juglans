const Juglans = require('juglans')
const CommonFields = require('../CommonFields')
const mongoose = Juglans.mongoose
const Schema = mongoose.Schema

const defineSchema = new Schema(Object.assign({}, CommonFields, {
  name_sc: {
    type: String,
    displayName: '角色名称',
    unique: true,
    required: '预警名称({PATH})不能为空'
  },
  name_tc: {
    type: String,
    displayName: '繁体名称'
  },
  name_en: {
    type: String,
    displayName: '英文名称'
  },
  type: {
    type: String,
    displayName: '角色类型',
    enum: [null, '管理角色', '业务角色'],
    default: '业务角色'
  },
  permissions: [{
    type: String,
    ref: 'Permission',
    displayName: '权限列表'
  }]
}))

/**
 * Role 模型
 * @param {Object} mongoose
 * @param {Object} router
 */
module.exports = function ({ router }) {
  const name = 'Role'
  const rPath = '/Role'
  mongoose.model(name, defineSchema)
  router.get(rPath, mongoose.hooks.list(name))
  router.post(rPath, mongoose.hooks.create(name))
  router.delete(rPath, mongoose.hooks.softDelMany(name))
}

/**
 * Schema 模型
 * 方便后期寻址
 */
module.exports.defineSchema = defineSchema
