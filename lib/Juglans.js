/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-05 03:10:49
 * @modify date 2019-01-05 03:10:49
 * @desc [Juglans FrameWork]
 */
/* =================== USAGE ===================
  const app = new Juglans({ name: 'Juglans V1.0' })
  app.Config(config)
  app.Inject(inject)
  app.Use(function({ router }) {
    router.get('/test', ctx => {
      ctx.body = 'test'
    })
  })
  app.Run(function (err, config) {
  })
 =============================================== */
const EventEmitter = require('events').EventEmitter
const koaRouter = require('koa-router')
const koaBody = require('koa-body')
const utils = require('util')
const Koa = require('koa')
const is = require('is')
const {
  scanInjectFiles,
  qPromise
} = require('./utils')

/**
 * Default injects params for Juglans
 * Default List:
 *  HttpProxy koa or express
 *  router    koa or express router
 *  config    app config
 */
const DefaultInjects = {}

/**
 * Default config for Juglans
 * Default List:
 * name    app name
 * prefix  app http prefix
 * port    listen on
 * debug   debug mode or not
 */
const DefaultConfig = {
  name: 'Juglans V1.0',
  prefix: '/api/v1',
  port: 3001,
  debug: true
}

/**
 * Default Middles for Juglans
 * Default List:
 * HttpProxy
 * router
 */
const DefaultMiddles = [
  ({ httpProxy, config: { prefix, bodyParser } }) => {
    const router = koaRouter({ prefix })
    router.use(koaBody(bodyParser))
    httpProxy.use(router.routes())
    httpProxy.use(router.allowedMethods())
    return {
      router
    }
  }
]

function Juglans (params) {
  if (!(this instanceof Juglans)) {
    return new Juglans(params)
  }
  this.config = DefaultConfig
  this.injects = DefaultInjects
  this.middles = DefaultMiddles.concat([
    () => {
      this.httpProxy = new Koa()
      return {
        httpProxy: this.httpProxy
      }
    }
  ]).reverse()
  if (is.object(params)) {
    Object.assign(this.config, params)
  }
}

/**
 * set config
 * all `config` just for middles, so set your `config` base on your middles use
 * Note:
 * if you call this func muti, `config` would be override
 */
Juglans.prototype.Config = function (params) {
  if (!params || !is.object(params)) {
    return this.config
  } else {
    Object.assign(this.config, params)
    this.Inject({ config: this.config })
  }
  return this
}

/**
 * add injects
 * return injects if no params be provided
 */
Juglans.prototype.Inject = function (...params) {
  if ((params && params.length === 0) || !params) {
    return this.injects
  } else {
    Object.assign(this.injects, ...params.filter(x => is.object(x)))
  }
  return this
}

/**
 * add plugins
 * return middles if no params be provided
 */
Juglans.prototype.Use = function (...params) {
  if ((params && params.length === 0) || !params) {
    return this.middles
  } else {
    this.middles = this.middles.concat(params.filter(x => is.function(x)))
  }
  return this
}

/**
 * Run app, qPromise func has some async call in function, so ...
 * all middles set by `Use` would be run before by setting `Config.depInject`
 */
Juglans.prototype.Run = function (cb) {
  const depInject = this.config.depInject
  const scanInjects = scanInjectFiles(depInject.path, depInject)
  this.Use(...scanInjects)
  this.Use(({ httpProxy, config }) => {
    httpProxy.listen(config.port, err => {
      cb(err, this.config)
    })
  })
  qPromise(this.middles, this.Inject.bind(this), {
    chainArgs: false,
    lazeArgs: true,
    execAfter: ret => {
      if (is.object(ret)) {
        this.Inject(ret)
      } else if (ret) {
        console.error(`no support inject T: ${ret}, should be object T!`)
      }
    }
  })
  return this
}

/**
 * Inherits in EventEmitter
 * on    listen event
 * emit  emitter event
 * Note:
 * There has no events now
 */
utils.inherits(Juglans, EventEmitter)
module.exports = Juglans
