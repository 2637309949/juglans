const CommonFields = require('../CommonFields')

const defineSchema = Object.assign({}, CommonFields, {
  _id: {
    type: String,
    required: true
  },
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
})

/**
 * Role 模型
 * @param {Object} mongoose
 * @param {Object} router
 */
module.exports = function ({ mongoose, router }) {
  const name = 'Role'
  const Schema = mongoose.Schema
  const schema = new Schema(defineSchema)
  schema.set('autoIndex', false)
  mongoose.model(name, schema)
  router.get('/Role', mongoose.hooks.list(name))
}
