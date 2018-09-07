/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-01 10:56:13
 * @modify date 2018-09-01 10:56:13
 * @desc [Juglans对象]
*/
const {
  InjectContext,
  ConfigContext,
  MiddleContext,
  ModelContext,
  DBContext,
  AuthContext,
  ExecContext
} = require('./handle')

/**
 * Julans构造器
 * @param {Object} params 配置参数
 */
function Juglans (params) {
  this.ConfigContext = ConfigContext(params)
  this.InjectContext = InjectContext()
  this.MiddleContext = MiddleContext()
  this.ModelContext = ModelContext()
  this.DBContext = DBContext()
  this.AuthContext = AuthContext()
  this.ExecContext = ExecContext()

  this.DBContext.setConfigContext(this.ConfigContext)
  this.DBContext.setInjectContext(this.InjectContext)

  this.InjectContext.setConfigContext(this.ConfigContext)
  this.ConfigContext.setInjectContext(this.InjectContext)

  this.MiddleContext.setInjectContext(this.InjectContext)
  this.MiddleContext.setConfigContext(this.ConfigContext)
  this.MiddleContext.setAuthContext(this.AuthContext)

  this.ModelContext.setConfigContext(this.ConfigContext)

  this.AuthContext.setConfigContext(this.ConfigContext)
  this.AuthContext.setModelContext(this.ModelContext)

  this.ExecContext.setConfigContext(this.ConfigContext)
  this.ExecContext.setModelContext(this.ModelContext)
  this.ExecContext.setInjectContext(this.InjectContext)
  this.ExecContext.setMiddleContext(this.MiddleContext)
}

/**
 * 配置应用
 * @param {Object} params App参数
 */
Juglans.prototype.setConfig = function (params) {
  this.ConfigContext.appendConfig(params)
  return this
}

/**
 * 注入参数
 * @param {Object} param 注入参数
 */
Juglans.prototype.inject = function (params) {
  this.InjectContext.appendInject(params)
  return this
}

/**
 * 中间件
 * @param {Object} param 中间件参数
 */
Juglans.prototype.middle = function (params) {
  this.MiddleContext.appendMiddle(params)
  return this
}

/**
 * 注册MONGOOSE
 * @param {Function} func 回调函数
 */
Juglans.prototype.mongo = function (func) {
  this.DBContext.mongo(func)
  return this
}

/**
 * 注册REDIS
 * @param {Function} func 回调函数
 */
Juglans.prototype.redis = function (func) {
  this.DBContext.redis(func)
  return this
}

/**
 * 认证插件
 * @param {Function} func 回调函数
 */
Juglans.prototype.auth = function (func) {
  this.AuthContext.setLoginCheck(func)
  return this
}

/**
 * 注册存储
 * @param {Function} func 回调函数
 */
Juglans.prototype.store = function (func) {
  this.ModelContext.setStoreFunc(func)
  return this
}

/**
 * RUN APP
 * @param {Function} func 回调函数
 */
Juglans.prototype.run = function (cb) {
  this.ExecContext.execute(cb)
  return this
}

module.exports = Juglans
