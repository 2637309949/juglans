
const Juglans = require('juglans')
const CommonFields = require('../CommonFields')
const mongoose = Juglans.mongoose
const Schema = mongoose.Schema

const defineSchema = new Schema(Object.assign({}, CommonFields, {
  username: {
    type: String,
    displayName: '账号',
    unique: true,
    required: '账号({PATH})不能为空',
    index: true
  },
  password: {
    type: String,
    displayName: '密码',
    required: '密码({PATH})不能为空'
  },
  is_active: {
    type: Boolean,
    displayName: '是否启用',
    default: true
  },
  is_repass: {
    type: Boolean,
    displayName: '是否已修改过密码',
    default: false
  },
  avatar: {
    type: String,
    displayName: '头像'
  },
  type: {
    type: String,
    displayName: '用户类型',
    enum: [null, '企业号', '自建']
  },
  name: {
    type: String,
    displayName: '姓名',
    required: '姓名({PATH})不能为空'
  },
  domain_account: {
    type: String,
    displayName: '主域账号'
  },
  subdomain_account: {
    type: String,
    displayName: '子域账号'
  },
  active_domain_account: {
    type: String,
    displayName: '域账号启用标记',
    remark: '1:主账号、2:子域账号'
  },
  domain_email: {
    type: String,
    displayName: '域邮箱'
  },
  english_name: {
    type: String,
    displayName: '英文名'
  },
  mobile: {
    type: String,
    displayName: '手机'
  },
  email: {
    type: String,
    displayName: '邮箱',
    remark: '冗余设计，同员工档案邮箱'
  },
  roles: [{
    type: String,
    ref: 'Role',
    displayName: '关联角色'
  }],
  // 微信的site + 自定义的site
  sites: [{
    type: String,
    ref: 'BdSite',
    displayName: '关联项目'
  }],
  // 微信过来的site
  wechat_sites: [{
    type: String,
    ref: 'BdSite',
    displayName: '关联项目'
  }],
  employee: {
    type: String,
    ref: 'BdEmployee',
    displayName: '关联员工'
  },
  department: [{
    displayName: '所属部门',
    type: String,
    ref: 'BdDepartment'
  }],
  locale: {
    type: String,
    displayName: '当前语言',
    remark: '需要切换更新'
  },
  deactive_time: {
    type: Number,
    displayName: '账号被锁定的时间',
    remark: '输错密码登陆超过次数后账号被锁定的时间'
  },
  signin_error_times: {
    type: Number,
    displayName: 'signin错误的次数',
    remark: 'signin错误的次数，比如输错密码'
  }
}))

defineSchema.statics.isManager = async (username) => {
  if (!username) return false
  const User = mongoose.model('User')
  const entity = await User.findOne({ username }, { roles: 1 }).populate('roles', 'roles.type')
  if (entity && Array.isArray(entity.roles) && entity.roles.length > 0) {
    for (const role of entity.roles) {
      if (role && role.type === '管理角色') {
        return true
      }
    }
    return false
  }
  return false
}

mongoose.model('User', defineSchema)

/**
 * Schema 模型
 * 方便后期寻址
 */
module.exports.defineSchema = defineSchema
