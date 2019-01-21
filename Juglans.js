/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-05 03:10:49
 * @modify date 2019-01-05 03:10:49
 * @desc [Juglans FrameWork Instance]
 */
const { EventEmitter } = require('events')
const assert = require('assert')
const is = require('is')

const plugins = require('./plugins')
const { scanPlugins, runPlugins, inherits } = require('./utils')

/**
 * Juglan Instance
 * @param {object} cfg app config
 * @param {object} httpProxy as `proxy http`, router as `http hander`
 */
function Juglans (cfg, { httpProxy, router } = {}) {
  if (!(this instanceof Juglans)) {
    return new Juglans(cfg, { httpProxy, router })
  }
  this.config = { name: 'Juglans V1.0', debug: true }
  this.injects = {}
  this.middles = []

  const defaultMiddles = [plugins.HttpProxy(httpProxy), plugins.HttpRouter(router)]
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
Juglans.prototype.Use = function (...plugins) {
  if ((plugins && plugins.length === 0) || !plugins) {
    return this.middles
  } else {
    assert(plugins.findIndex(x => !is.function(x) && !(is.object(x) && is.function(x.plugin))) === -1, 'plugin entity should be a function')
    plugins = plugins
      .map(x => (is.function(x) && x) || x)
      .map(x => (is.object(x) && is.function(x.plugin) && x.plugin.bind(x)) || x)
      .filter(x => is.function(x))
    this.middles = this.middles.concat(plugins)
  }
  return this
}

/**
 * Run app, qPromise func has some async call in function, so ...
 * all middles set by `Use` would be run before by setting `Config.depInject`
 */
Juglans.prototype.Run = function (cb) {
  const LastMiddles = [plugins.ProxyRun(cb)]
  const scanPgs = scanPlugins(this.config.depInject)
  this
    .Use(...scanPgs)
    .Use(...LastMiddles)
  return runPlugins(
    this.middles,
    this.Inject.bind(this),
    {
      chainArgs: false,
      lazeArgs: true,
      execAfter: ret => {
        if (is.object(ret) && Object.keys(ret).length >= 1) {
          this.Inject(ret)
        }
      }
    })
}
module.exports = inherits(Juglans, EventEmitter)
