
/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-04 09:54:30
 * @modify date 2018-09-04 09:54:30
 * @desc [ExecContext参数应用对象]
*/
const utils = require('../utils')
const Http = require('../http')
const is = require('is')

function ExecContext ({
  ConfigContext,
  InjectContext,
  MiddleContext,
  ModelContext
} = {}) {
  if (!(this instanceof ExecContext)) {
    return new ExecContext({ConfigContext, InjectContext, MiddleContext, ModelContext})
  }
  this.ConfigContext = ConfigContext
  this.InjectContext = InjectContext
  this.MiddleContext = MiddleContext
  this.ModelContext = ModelContext
}

ExecContext.prototype.setModelContext = function (ModelContext) {
  this.ModelContext = ModelContext
  return this
}

ExecContext.prototype.setMiddleContext = function (MiddleContext) {
  this.MiddleContext = MiddleContext
  return this
}

ExecContext.prototype.setConfigContext = function (ConfigContext) {
  this.ConfigContext = ConfigContext
  return this
}

ExecContext.prototype.setInjectContext = function (InjectContext) {
  this.InjectContext = InjectContext
  return this
}

/**
 * 执行函数
 * @param {Function} cb 回调函数
 */
ExecContext.prototype.execute = function (cb) {
  const config = this.ConfigContext.getConfig()
  const injectParams = this.InjectContext.getInject()

  const { port, injectPath, ignorePath: ignore } = config
  this.MiddleContext.buildRouterMiddles()
  if (injectPath) {
    const funcs = utils.scanInjectFiles(injectPath, { ignore })
    funcs.forEach((func) => {
      func(injectParams)
    })
  }
  this.ModelContext.buildStoreModel()
  const middles = this.MiddleContext.getMiddle()
  const app = Http({ port, middles })
  app.listen(cb)
}

module.exports = ExecContext
