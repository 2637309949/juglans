const koaRouter = require('koa-router')
const koaBody = require('koa-body')
const is = require('is')
const Koa = require('koa')
const EventEmitter = require('events').EventEmitter
const inherits = require('util').inherits
const utils = require('./utils')

const DefaultInjects = {}
const DefaultConfig = {}
const DefaultMiddles = juglans => [
  () => {
    juglans.httpProxy = new Koa()
    return {
      httpProxy: juglans.httpProxy
    }
  },
  ({ httpProxy, config: { prefix, bodyParser } }) => {
    const router = koaRouter({ prefix })
    router.use(koaBody(bodyParser))
    httpProxy.use(router.routes())
    httpProxy.use(router.allowedMethods())
    return {
      router
    }
  }]

// Juglans contructor
function Juglans (params) {
  this.cfg = DefaultConfig
  this.injects = DefaultInjects
  this.middles = DefaultMiddles(this)
  if (is.object(params)) {
    Object.assign(this.cfg, params)
  }
}

Juglans.prototype.config = function (params) {
  if (!params) {
    return this.cfg
  } else {
    Object.assign(this.cfg, params)
    this.inject({ config: this.cfg })
  }
  return this
}

Juglans.prototype.inject = function (...params) {
  if ((params && params.length === 0) || !params) {
    return this.injects
  } else {
    Object.assign(this.injects, ...params.filter(x => is.object(x)))
  }
  return this
}

Juglans.prototype.use = function (...params) {
  if ((params && params.length === 0) || !params) {
    return this.middles
  } else {
    this.middles = this.middles.concat(params.filter(x => is.function(x)))
  }
  return this
}

Juglans.prototype.run = function (cb) {
  const { depInject, port } = this.cfg
  this.use(...utils.scanInjectFiles(depInject.path, depInject))
  this.use(({ httpProxy }) => {
    httpProxy.listen(port, err => {
      cb(err, this.cfg)
    })
  })
  utils.qPromise(this.middles, this.inject.bind(this), {
    chainArgs: false,
    lazeArgs: true,
    execAfter: ret => {
      if (is.object(ret)) {
        this.inject(ret)
      } else if (ret) {
        console.error(`no support inject T: ${ret}, should be object T!`)
      }
    }
  })
  return this
}

inherits(Juglans, EventEmitter)
module.exports = Juglans
