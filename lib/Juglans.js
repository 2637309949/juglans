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
const assert = require('assert')
const is = require('is')

const plugins = require('../lib/plugins')
const { scanPlugins, qPromise, inherits } = require('./utils')

/**
 * Juglan Instance
 * @param {object} cfg app config
 * @param {object} httpProxy as `proxy http`, router as `http hander`
 */
function Juglans (cfg, { httpProxy, router } = {}) {
  if (!(this instanceof Juglans)) {
    return new Juglans(cfg, { httpProxy, router })
  }
  // config, inject, middles init
  // name param:
  //  just for iden app
  // prefix param:
  //  router prefix
  // debug:
  // just for iden mode
  this.config = this.config || { name: 'Juglans V1.0', prefix: '/api/v1', port: 3001, debug: true }
  this.injects = this.injects || {}
  this.middles = this.middles || []
  const defaultMiddles = this.middles.length >= 2 ? [] : [plugins.HttpProxy(httpProxy), plugins.HttpRouter(router)]
  this.Use(...defaultMiddles)
  this.Config(cfg)
}

/**
 * set config
 * all `config` just for middles, so set your `config` base on your middles use
 * Note:
 * if you call this func muti, `cfg` would be override
 */
Juglans.prototype.Config = function (cfg) {
  if (!cfg || !is.object(cfg)) {
    return this.config
  } else if (is.object(cfg) && Object.keys(cfg).length > 0) {
    Object.assign(this.config, cfg)
    this.Inject({ config: this.config })
  }
  return this
}

/**
 * add injects
 * return injects if no params be provided
 * Note:
 * Inject entity must be a object(uniqueness keys)
 */
Juglans.prototype.Inject = function (...params) {
  if ((params && params.length === 0) || !params) {
    return this.injects
  } else {
    assert(params.findIndex(x => !is.object(x)) === -1, 'inject entity should be a object')
    Object.assign(this.injects, ...params)
  }
  return this
}

/**
 * add plugins
 * return middles if no params be provided
 * Note:
 * Plugin entity must be a function entity
 */
Juglans.prototype.Use = function (...params) {
  if ((params && params.length === 0) || !params) {
    return this.middles
  } else {
    assert(params.findIndex(x => !is.function(x) && !(is.object(x) && is.function(x.plugin))) === -1, 'plugin entity should be a function')
    params = params
      .map(x => {
        if (is.function(x)) {
          return x
        }
        if (is.object(x) && is.function(x.plugin)) {
          const plugin = x.plugin()
          if (is.function(plugin)) {
            return plugin
          }
          return x.plugin
        }
      })
      .filter(x => is.function(x))
    this.middles = this.middles.concat(params)
  }
  return this
}

/**
 * Run app, qPromise func has some async call in function, so ...
 * all middles set by `Use` would be run before by setting `Config.depInject`
 */
Juglans.prototype.Run = function (cb) {
  const sPlugins = scanPlugins(this.config.depInject || { path: [] })
  const LastMiddles = [plugins.LastMiddles(cb)]
  this.Use(...sPlugins).Use(...LastMiddles)
  return qPromise(this.middles, this.Inject.bind(this), {
    chainArgs: false,
    lazeArgs: true,
    execAfter: ret => {
      if (is.object(ret) && Object.keys(ret).length >= 1) {
        this.Inject(ret)
      } else if (ret) {
        throw new Error(`no support inject T: ${ret}, should be object T!`)
      }
    }
  }).catch(err => {
    console.error(`qPromise Error:${err}`)
    throw new Error(`qPromise Error:${err}`)
  })
}
module.exports = inherits(Juglans, EventEmitter)
