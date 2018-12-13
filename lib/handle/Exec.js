const Koa = require('koa')
const is = require('is')
const assert = require('assert')
const utils = require('../utils')

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
  assert.ok(is.function(func), 'no support')
  this.context = func
  return this
}

ExecContext.prototype.createApp = function () {
  let app = new Koa()
  if (this.context) {
    this.context(app)
  }
  this.InjectContext.appendInject({ app })
  return app
}

ExecContext.prototype.appRouter = function (app) {
  return this.MiddleContext.koaRouter(app)
}

ExecContext.prototype.appInject = function (depInject, injects) {
  // inject first
  this.MiddleContext.getMiddle()
    .filter(x => is.function(x))
    .forEach(func => func(injects))
  // inject second
  utils.scanInjectFiles(depInject.path, depInject)
    .forEach(func => {
      func(this.injects)
    })
}

ExecContext.prototype.execute = function (cb) {
  const app = this.createApp()
  // App use
  this.appRouter(app)
  // Router use
  this.appInject(this.config.depInject, this.injects)
  // App listen
  app.listen(this.config.port, (err) => cb(err, this.config))
}

module.exports = ExecContext
