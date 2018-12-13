const Exec = require('./Exec')
const utils = require('../utils')
const Inject = require('./Inject')
const Config = require('./Config')
const Middle = require('./Middle')

const suffix = 'Context'
/**
 * 所有handle导出
 */
module.exports.handles = utils.mapKV({
  Inject,
  Config,
  Middle,
  Exec
}, kv => ({ key: `${kv.key}${suffix}`, value: kv.value }))

/**
 * 所有实例化
 * @param {Object} params 参数
 */
module.exports.createHandles = function (params, bind) {
  const on = bind.on.bind(bind)
  const emit = bind.emit.bind(bind)
  return utils.mapObject(module.exports.handles, (key, Handle) => {
    Handle.prototype.on = on
    Handle.prototype.emit = emit
    const handle = Handle(params)
    bind[key] = handle
    return handle
  })
}

/**
 * 依赖配置
 * @param {Object} params
 */
module.exports.setHandleDepts = function (bind) {
  const depends = utils.take(bind, Object.keys(module.exports.handles))
  Object.keys(depends).forEach(key => {
    bind[key].onDepends(depends)
  })
  return this
}
