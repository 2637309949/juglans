
/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-04 09:54:30
 * @modify date 2018-09-04 09:54:30
 * @desc [ExecContext参数应用对象]
*/
const Koa = require('koa')
const is = require('is')
const utils = require('../utils')

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

ExecContext.prototype.setContext = function (func) {
  if (is.function(func)) {
    this.context = func
  }
  return this
}

ExecContext.prototype.unpack = function () {
  this.injectParams = this.InjectContext.getInject()
  this.config = this.ConfigContext.getConfig()
  this.middles = this.MiddleContext.getMiddle()
  return this
}

ExecContext.prototype.inject = function () {
  const injectParams = this.injectParams
  const injectPath = this.config.injectPath
  const ignore = this.config.ignorePath
  if (injectPath) {
    utils.scanInjectFiles(injectPath, {
      ignore
    }).forEach((func) => {
      func(injectParams)
    })
  }
}

ExecContext.prototype.buildRouterMiddles = function () {
  this.MiddleContext.buildRouterMiddles()
  return this
}

ExecContext.prototype.buildStoreModel = function () {
  this.ModelContext.buildStoreModel()
  return this
}

ExecContext.prototype.runHttp = function (cb) {
  const config = this.config
  const port = config.port
  const middles = this.middles
  let app = new Koa()
  if (this.context) {
    const result = this.context(app)
    app = result || app
  }
  middles.forEach(midd => {
    app.use(midd)
  })
  app.listen(port, function (err) {
    cb(err, config)
  })
  return this
}

/**
 * 执行函数
 * @param {Function} cb 回调函数
 */
ExecContext.prototype.execute = function (cb) {
  this.buildRouterMiddles()
  this.unpack()
  this.inject()
  this.buildStoreModel()
  this.runHttp(cb)
}

module.exports = ExecContext
