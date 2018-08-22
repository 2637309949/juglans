module.exports = {
  site: {
    type: String,
    ref: 'BdSite',
    displayName: '所属项目'
  },
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
    default: false
  },
  _ts: {
    type: Number,
    displayName: '时间戳',
    remark: 'UNIX时间戳'
  },
  _remark: {
    type: String,
    displayName: '备注'
  }
}
