const Exec = require('./Exec')
const utils = require('../utils')
const Inject = require('./Inject')
const Config = require('./Config')
const Middle = require('./Middle')

const suffix = 'Context'

/**
 * 所有Context导出
 */
module.exports.handlers = utils.mapKV({
  Inject,
  Config,
  Middle,
  Exec
}, kv => ({ key: `${kv.key}${suffix}`, value: kv.value }))

/**
 * 所有Context实例化
 * @param {Object} params 参数
 */
module.exports.assignContext = function (params, bind) {
  const on = bind.on.bind(bind)
  const emit = bind.emit.bind(bind)
  return utils.mapObject(module.exports.handlers, (key, Handle) => {
    Handle.prototype.on = on
    Handle.prototype.emit = emit
    const handler = Handle(params)
    bind[key] = handler
    return handler
  })
}

/**
 * 依赖配置
 * @param {Object} params
 */
module.exports.setContextDepts = function (bind) {
  const depends = utils.take(bind, Object.keys(module.exports.handlers))
  Object.keys(depends).forEach(key => {
    bind[key].onDepends(depends)
  })
  return this
}
