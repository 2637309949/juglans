/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-01 10:53:28
 * @modify date 2018-09-01 10:53:28
 * @desc [Juglans辅助函数]
*/
const InjectContext = require('./handle/InjectContext')
const ConfigContext = require('./handle/ConfigContext')
const MiddleContext = require('./handle/MiddleContext')
const ModelContext = require('./handle/ModelContext')
const DBContext = require('./handle/DBContext')
const AuthContext = require('./handle/AuthContext')
const ExecContext = require('./handle/ExecContext')

const repo = exports

/**
 * 初始化配置
 * @param {Object} params 初始化参数
 */
repo._initParams = function (params) {
  // ConfigContext
  this.ConfigContext = ConfigContext(params)

  // InjectContext
  this.InjectContext = InjectContext({
    ConfigContext: this.ConfigContext
  })

  // MiddleContext
  this.MiddleContext = MiddleContext()
  // ModelContext
  this.ModelContext = ModelContext()

  // DBContext
  this.DBContext = DBContext({
    ConfigContext: this.ConfigContext,
    InjectContext: this.InjectContext
  })

  // AuthContext
  this.AuthContext = AuthContext({
    ModelContext: this.ModelContext,
    ConfigContext: this.ConfigContext
  })

  // ExecContext
  this.ExecContext = ExecContext({
    ConfigContext: this.ConfigContext,
    InjectContext: this.InjectContext,
    MiddleContext: this.MiddleContext,
    ModelContext: this.ModelContext
  })

  // Dependency
  this.ConfigContext.setInjectContext(this.InjectContext)
  this.MiddleContext.setInjectContext(this.InjectContext)
  this.MiddleContext.setConfigContext(this.ConfigContext)
  this.MiddleContext.setAuthContext(this.AuthContext)
  this.ModelContext.setConfigContext(this.ConfigContext)
}
