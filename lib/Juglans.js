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
const {
  scanInjects,
  qPromise,
  inherits
} = require('./utils')

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
  this.config = { name: 'Juglans V1.0', prefix: '/api/v1', port: 3001, debug: true }
  this.injects = {}
  this.middles = []
  this.Use(plugins.HttpProxy(httpProxy), plugins.HttpRouter(router))
  // assgin app config
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
    assert(params.findIndex(x => !is.function(x)) === -1, 'plugin entity should be a function')
    this.middles = this.middles.concat(params)
  }
  return this
}

/**
 * Run app, qPromise func has some async call in function, so ...
 * all middles set by `Use` would be run before by setting `Config.depInject`
 */
Juglans.prototype.Run = function (cb) {
  // scan middles from configPath
  // Those middles is disorder
  try {
    if (this.config.depInject) {
      this.Use(...scanInjects(this.config.depInject))
    }
  } catch (error) {
    throw new Error(`scan injects error:${error}`)
  }
  this.Use(plugins.LastMiddles(cb))
  // call middles and chain result
  // return the last middle `ret`
  return qPromise(this.middles, this.Inject.bind(this), {
    chainArgs: false,
    lazeArgs: true,
    execAfter: ret => {
      if (is.object(ret) && Object.keys(ret).length >= 1) {
        this.Inject(ret)
      } else if (ret) {
        console.error(`no support inject T: ${ret}, should be object T!`)
      }
    },
    execBefore: ret => {
      // before every exec middle
    }
  }).catch(err => {
    console.error(`qPromise Error:${err}`)
  })
}

module.exports = inherits(Juglans, EventEmitter)
