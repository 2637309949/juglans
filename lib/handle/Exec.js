
/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-04 09:54:30
 * @modify date 2018-09-04 09:54:30
 * @desc [ExecContext参数应用对象]
*/
const Koa = require('koa')
const is = require('is')
const core = require('../utils').core
const consts = require('../consts')

const assign = Object.assign
function ExecContext () {
  if (!(this instanceof ExecContext)) {
    return new ExecContext()
  }
}

ExecContext.prototype.onDepends = function (params) {
  assign(this, params)
  this.config = this.ConfigContext.getConfig()
  this.injects = this.InjectContext.getInject()
}

ExecContext.prototype.setContext = function (func) {
  if (is.function(func)) {
    this.context = func
  } else {
    throw new Error('nonsupport!')
  }
  return this
}

ExecContext.prototype.createApp = function () {
  let app = new Koa()
  if (this.context) {
    this.context(app)
  }
  return app
}

ExecContext.prototype.appRouter = function (app) {
  const router = this.MiddleContext.koaRouter()
  this.MiddleContext.getAppMiddle(router)
    .forEach(middle => {
      app.use(middle)
    })
  return router
}

ExecContext.prototype.appUse = function (router) {
  this.MiddleContext.getMiddle()
    .filter(x => is.function(x))
    .forEach(func => func(this.injects))
  return router
}

ExecContext.prototype.appInject = function () {
  const depInject = this.config.depInject
  core.scanInjectFiles(depInject.path, {
    ignore: depInject.ignore
  }).forEach(func => {
    func(this.injects)
  })
}

ExecContext.prototype.execute = function (cb) {
  const app = this.createApp()
  const router = this.appRouter(app)
  this.appUse(router)
  this.appInject()

  // listen
  app.listen(this.config.port, (err) => {
    if (!err) {
      this.emit(consts.event.INSTANCE_UP_SUCCESSFUL)
    } else {
      this.emit(consts.event.INSTANCE_UP_FAILING)
    }
    cb(err, this.config)
  })
}

module.exports = ExecContext
