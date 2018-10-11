const Juglans = require('juglans')
const CommonFields = require('../CommonFields')
const mongoose = Juglans.mongoose
const Schema = mongoose.Schema

const defineSchema = new Schema(Object.assign({}, CommonFields, {
  path: {
    type: String,
    displayName: '任务路径'
  },
  name: {
    type: String,
    displayName: '任务名称',
    unique: true,
    required: '任务名称({PATH})不能为空'
  },
  enable: {
    type: Boolean,
    displayName: '是否激活',
    default: true
  }
}))

mongoose.model('Task', defineSchema)

/**
 * Role 模型
 * @param {Object} mongoose
 * @param {Object} router
 */
module.exports = function ({ router }) {
  router.get('/Task', async ctx => {
    try {
      const Task = mongoose.model('Task')
      const action = ctx.query.action
      const name = ctx.query.name
      const taskDoc = await Task.findOne({ name })
      if (action === 'callback') {
        const task = require(taskDoc.path).defineSchedule
        task.callback()
      }
      ctx.body = { errcode: null, errmsg: null, data: 'executing...' }
    } catch (error) {
      console.error(error.stack)
      ctx.body = { errcode: 500, errmsg: error.message }
    }
  })
}

/**
 * Schema 模型
 * 方便后期寻址
 */
module.exports.defineSchema = defineSchema
