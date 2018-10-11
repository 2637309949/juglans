/**
 * @author [Double]
 * @email [example@mail.com]
 * @create date 2018-10-11 21:13:32
 * @modify date 2018-10-11 21:13:32
 * @desc [模型共同属性]
*/

module.exports = {
  _creator: {
    type: String,
    displayName: '创建人',
    ref: 'User'
  },
  _modifier: {
    type: String,
    displayName: '修改人',
    ref: 'User'
  },
  _created: {
    type: Number,
    displayName: '创建时间',
    remark: 'UNIX时间戳',
    index: true
  },
  _modified: {
    type: Number,
    displayName: '修改时间',
    remark: 'UNIX时间戳',
    index: true
  },
  _dr: {
    type: Boolean,
    displayName: '删除标记',
    default: false,
    require: true
  }
}
