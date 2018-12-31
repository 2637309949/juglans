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
ExecContext.prototype.httpProxy = function (bind) {
  bind.httpProxy = new Koa()
  const httpListen = bind.httpProxy.listen.bind(bind.httpProxy)
  bind.httpProxy.listen = cb => {
    const config = this.getConfig()
    httpListen(config.port, err => cb(err, config))
  }
  this.appendInject({ httpProxy: bind.httpProxy })
  return bind.httpProxy
}

// concat middlesUse and middlesScan
// middlesUse before middlesScan
ExecContext.prototype.getMiddle = function () {
  const { depInject } = this.getConfig()
  const middlesUse = this.MiddleContext.getMiddle()
  const middlesScan = utils.scanInjectFiles(depInject.path, depInject)
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

// listen
ExecContext.prototype.listen = function (httpProxy, cb) {
  httpProxy.listen(cb)
  return this
}

// execute
ExecContext.prototype.execute = function ({ httpProxy }, cb) {
  try {
    this.listen(httpProxy, cb)
    this.inject()
  } catch (error) {
    console.error(error)
    throw error
  }
}

module.exports = ExecContext
