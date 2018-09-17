const Juglans = require('../../../../..')
const CommonFields = require('../CommonFields')
const mongoose = Juglans.mongoose
const Schema = mongoose.Schema

const defineSchema = new Schema(Object.assign({}, CommonFields, {
  name: {
    type: String,
    displayName: '角色名称',
    unique: true,
    required: '预警名称({PATH})不能为空'
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

defineSchema.set('autoIndex', false)

/**
 * Role 模型
 * @param {Object} mongoose
 * @param {Object} router
 */
module.exports = function ({ router }) {
  const name = 'Role'
  mongoose.model('Role', defineSchema)
  router.get('/Role', mongoose.hooks.list(name))
  router.post('/Role', mongoose.hooks.create(name))
  router.delete('/Role', mongoose.hooks.softDelMany(name))
}
