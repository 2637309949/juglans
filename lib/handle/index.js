/**
 * @author [Double]
 * @email [267309949@qq.com]
 * @create date 2018-09-07 02:32:27
 * @modify date 2018-09-07 02:32:27
 * @desc [导出应用]
*/
const Inject = require('./Inject')
const Config = require('./Config')
const Middle = require('./Middle')
const Model = require('./Model')
const DB = require('./DB')
const Auth = require('./Auth')
const Exec = require('./Exec')
const utils = require('../utils')

/**
 * 所有handle导出
 */
module.exports.handles = {
  Inject,
  Config,
  Middle,
  Model,
  DB,
  Auth,
  Exec
}

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
    bind[key] = Handle(params)
    return bind[key]
  })
}

/**
 * 依赖配置
 * @param {Object} params
 */
module.exports.setHandleDepts = function (bind) {
  const depends = utils.take(bind, Object.keys(module.exports.handles))
  Object.keys(module.exports.handles).forEach(key => {
    bind[key].onDepends(depends)
  })
  return this
}
