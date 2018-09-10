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

module.exports = {
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
module.exports.ctHandleAndAttach = function (params, bind) {
  const ctxs = {
    ConfigContext: ConfigContext(params),
    InjectContext: InjectContext(),
    MiddleContext: MiddleContext(),
    ModelContext: ModelContext(),
    DBContext: DBContext(),
    AuthContext: AuthContext(),
    ExecContext: ExecContext()
  }
  Object.keys(ctxs).forEach(key => {
    const value = ctxs[key]
    bind[key] = value
  })
  return ctxs
}

/**
 * 依赖配置
 * @param {Object} param0
 */
module.exports.ctDeptFromHost = function (bind) {
  // DBContext
  bind.DBContext.setConfigContext(bind.ConfigContext)
  bind.DBContext.setInjectContext(bind.InjectContext)
  // InjectContext
  bind.InjectContext.setConfigContext(bind.ConfigContext)
  bind.ConfigContext.setInjectContext(bind.InjectContext)
  // MiddleContext
  bind.MiddleContext.setInjectContext(bind.InjectContext)
  bind.MiddleContext.setConfigContext(bind.ConfigContext)
  bind.MiddleContext.setAuthContext(bind.AuthContext)
  // ModelContext
  bind.ModelContext.setConfigContext(bind.ConfigContext)
  // AuthContext
  bind.AuthContext.setConfigContext(bind.ConfigContext)
  bind.AuthContext.setModelContext(bind.ModelContext)
  // ExecContext
  bind.ExecContext.setConfigContext(bind.ConfigContext)
  bind.ExecContext.setModelContext(bind.ModelContext)
  bind.ExecContext.setInjectContext(bind.InjectContext)
  bind.ExecContext.setMiddleContext(bind.MiddleContext)
}
