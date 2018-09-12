/**
 * @author [Double]
 * @email [267309949@qq.com]
 * @create date 2018-09-07 02:32:27
 * @modify date 2018-09-07 02:32:27
 * @desc [导出应用]
*/

const InjectContext = require('./InjectContext')
const ConfigContext = require('./ConfigContext')
const MiddleContext = require('./MiddleContext')
const ModelContext = require('./ModelContext')
const DBContext = require('./DBContext')
const AuthContext = require('./AuthContext')
const ExecContext = require('./ExecContext')
const utils = require('../utils')

const handles = {
  InjectContext,
  ConfigContext,
  MiddleContext,
  ModelContext,
  DBContext,
  AuthContext,
  ExecContext
}

/**
 * 所有实例化
 * @param {Object} params 参数
 */
module.exports.createHandles = function (params, bind) {
  return utils.kvMap(handles, (key, Handle) => {
    bind[key] = Handle(params)
    return bind[key]
  })
}

/**
 * 依赖配置
 * @param {Object} params
 */
module.exports.setHandleDepts = function (bind) {
  const depends = utils.take(bind, Object.keys(handles))
  Object.keys(handles).forEach(key => {
    bind[key].onDepends(depends)
  })
  return this
}
