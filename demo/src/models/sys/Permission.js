const CommonFields = require('../CommonFields')

const defineSchema = Object.assign({}, CommonFields, {
  _id: {
    type: String,
    required: true
  },
  code: {
    type: String,
    unique: true,
    displayName: '权限编码',
    required: '权限编码({PATH})不能为空'
  },
  name: {
    type: String,
    displayName: '权限名称',
    required: '权限名称({PATH})不能为空'
  },
  pid: {
    type: String,
    displayName: '上级权限',
    default: null
  },
  type: {
    type: String,
    displayName: '权限类型',
    enum: ['一级菜单', '二级菜单', '三级菜单', '按钮', '自定义'],
    default: '自定义'
  },
  holder: {
    type: String,
    displayName: '权限持有者',
    enum: ['系统', '用户'],
    default: '用户'
  }
})

module.exports = function ({ mongoose }) {
  const Schema = mongoose.Schema
  const schema = new Schema(defineSchema)
  schema.set('autoIndex', false)
  mongoose.model('Permission', schema)
}
