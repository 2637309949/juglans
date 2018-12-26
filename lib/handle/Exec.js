const Koa = require('koa')
const is = require('is')
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

ExecContext.prototype.createApp = function () {
  const app = new Koa()
  this.InjectContext.appendInject({ app })
  return app
}

/**
 * 获取中间插件(优先代码机制(有序)，其次代码扫描的插件(无序))
 */
ExecContext.prototype.getMiddle = function (depInject) {
  const middlesUse = this.MiddleContext.getMiddle()
  const middlesScan = utils.scanInjectFiles(depInject.path, depInject)
  return middlesUse.concat(middlesScan)
}

/**
 * 代码注入
 */
ExecContext.prototype.appInject = function (depInject) {
  this.getMiddle(depInject)
    .filter(x => is.function(x))
    .forEach(func => {
      const inject = func(this.injects)
      if (is.object(inject)) {
        this.InjectContext.appendInject(inject)
      }
    })
}

ExecContext.prototype.execute = function (cb) {
  const app = this.createApp()
  // Router use
  this.appInject(this.config.depInject)
  // App listen
  app.listen(this.config.port, (err) => cb(err, this.config))
}

module.exports = ExecContext
