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
module.exports.allInstance = function (params) {
  return {
    ConfigContext: ConfigContext(params),
    InjectContext: InjectContext(),
    MiddleContext: MiddleContext(),
    ModelContext: ModelContext(),
    DBContext: DBContext(),
    AuthContext: AuthContext(),
    ExecContext: ExecContext()
  }
}

/**
 * 依赖配置
 * @param {Object} param0
 */
module.exports.dependOn = function ({
  ConfigContext,
  InjectContext,
  MiddleContext,
  ModelContext,
  DBContext,
  AuthContext,
  ExecContext
}) {
  DBContext.setConfigContext(ConfigContext)
  DBContext.setInjectContext(InjectContext)

  InjectContext.setConfigContext(ConfigContext)
  ConfigContext.setInjectContext(InjectContext)

  MiddleContext.setInjectContext(InjectContext)
  MiddleContext.setConfigContext(ConfigContext)
  MiddleContext.setAuthContext(AuthContext)

  ModelContext.setConfigContext(ConfigContext)

  AuthContext.setConfigContext(ConfigContext)
  AuthContext.setModelContext(ModelContext)

  ExecContext.setConfigContext(ConfigContext)
  ExecContext.setModelContext(ModelContext)
  ExecContext.setInjectContext(InjectContext)
  ExecContext.setMiddleContext(MiddleContext)
}
