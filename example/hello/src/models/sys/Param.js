const Juglans = require('juglans')
const CommonFields = require('../CommonFields')
const mongoose = Juglans.mongoose
const Schema = mongoose.Schema

const defineSchema = new Schema(Object.assign({}, CommonFields, {
  code: {
    type: String,
    unique: true,
    displayName: '参数编码'
  },
  desc: {
    type: String,
    displayName: '参数描述'
  },
  value: {
    type: Schema.Types.Mixed,
    displayName: '参数值',
    remark: {
      '隐藏值1': {
        label: '显示值2',
        children: [
          { '101': { label: '测试子节点1' } },
          { '102': { label: '测试子节点2' } },
          { '103': { label: '测试子节点3' } },
          {
            '104': {
              label: '测试子节点3',
              children: [
                { '10401': { label: '更深一级节点1' } },
                { '10402': { label: '更深一级节点2' } }
              ]
            }
          }
        ]
      },
      '隐藏值2': { label: '显示值2' },
      '0': { label: '女' },
      '1': { label: '男' }
    }
  }
}))

mongoose.model('Param', defineSchema)

/**
 * Schema 模型
 * 方便后期寻址
 */
module.exports.defineSchema = defineSchema
