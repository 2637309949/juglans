const Koa = require('koa')
const is = require('is')
const utils = require('../utils')

function ExecContext () {
  if (!(this instanceof ExecContext)) {
    return new ExecContext()
  }
}

// setup dep and convenience func
ExecContext.prototype.onDepends = function (params) {
  Object.assign(this, params)
  this.appendInject = this.InjectContext.appendInject.bind(this.InjectContext)
  this.getInject = this.InjectContext.getInject.bind(this.InjectContext)
  this.getConfig = this.ConfigContext.getConfig.bind(this.ConfigContext)
}

// setup a koa app
ExecContext.prototype.httpProxy = function () {
  const app = new Koa()
  this.appendInject({ app })
  return app
}

// concat middlesUse and middlesScan
ExecContext.prototype.getMiddle = function () {
  const { depInject } = this.getConfig()
  const middlesUse = this.MiddleContext.getMiddle()
  const middlesScan = utils.scanInjectFiles(depInject.path, depInject)
  // middlesUse before middlesScan
  return middlesUse.concat(middlesScan).filter(x => is.function(x))
}

// inject all dep
ExecContext.prototype.inject = function () {
  const middles = this.getMiddle()
  utils.qPromise(middles, this.getInject, {
    chainArgs: false,
    lazeArgs: true,
    execAfter: ret => {
      if (is.object(ret)) {
        this.appendInject(ret)
      } else if (ret) {
        console.error(`no support inject T: ${ret}, should be object T!`)
      }
    }
  })
}

// execute all
ExecContext.prototype.execute = function (cb) {
  try {
    const config = this.getConfig()
    const port = config.port
    this.httpProxy()
      .listen(port, err => cb(err, config))
    this.inject()
  } catch (error) {
    console.error(error)
    throw error
  }
}

module.exports = ExecContext
