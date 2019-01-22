/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-05 03:10:49
 * @modify date 2019-01-05 03:10:49
 * @desc [Juglans FrameWork Instance]
 */
/* =================== USAGE ===================
const app = new Juglans({ name: 'Juglans V1.0' })
app.Config(cfg)
app.Inject(inject)
app.Use(
  Logs({
    record: async () => {}
  }),
  Delivery(),
  function({ router }) {
    router.get('/hello', ctx => {
      ctx.body = 'juglans'
    })
  }
)
app.Run(function (err, config) {
    if (!err) {
      console.log(`App:${config.name}`)
      console.log(`App:${config.NODE_ENV}`)
      console.log(`App:runing on Port:${config.port}`)
    } else {
      console.error(err)
    }
})
=============================================== */

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
function Juglans (cfg = {}, { httpProxy, router } = {}) {
  if (!(this instanceof Juglans)) {
    return new Juglans(cfg, { httpProxy, router })
  }
  this.config = { name: 'Juglans V1.0', debug: true }
  this.injects = {}
  this.middles = []

  const dMiddles = [plugins.HttpProxy(httpProxy), plugins.HttpRouter(router)]
  this.Use(...dMiddles)
  this.Config(cfg)
}

/**
 * set config
 * @param {Array} params
 * all `config` just for middles, so set your `config` base on your middles use
 * Note:
 * if you call this func muti, `params` would be override
 */
Juglans.prototype.Config = function (...params) {
  assert(params.findIndex(x => !is.object(x)) === -1, 'Config entity should be a object')
  const configs = [this.config]
  configs.reduce((acc, curr) => {
    Object.keys(curr).forEach(k => {
      const index = acc.indexOf(k)
      if (index !== -1) {
        console.warn(`key[Config]:${k} has existed, and would be overrided.`)
      }
      acc = acc.concat([k])
    })
    return acc
  }, params.reduce((acc, curr) => {
    Object.keys(curr).forEach(k => {
      const index = acc.indexOf(k)
      if (index !== -1) {
        console.warn(`key[Config]:${k} has existed, and would be overrided.`)
      }
      acc = acc.concat([k])
    })
    return acc
  }, []))
  Object.assign(this.config, ...params)
  this.Inject({ config: this.config })
  return this
}

/**
 * add injects
 * @param {Array} params
 * return injects if no params be provided
 * Note:
 * Inject entity must be a object(uniqueness keys)
 */
Juglans.prototype.Inject = function (...params) {
  assert(params.findIndex(x => !is.object(x)) === -1, 'Inject entity should be a object')
  const injects = [this.injects]
  injects.reduce((acc, curr) => {
    Object.keys(curr).forEach(k => {
      const index = acc.indexOf(k)
      if (index !== -1) {
        console.warn(`key[Inject]:${k} has existed, and would be overrided.`)
      }
      acc = acc.concat([k])
    })
    return acc
  }, params.reduce((acc, curr) => {
    Object.keys(curr).forEach(k => {
      const index = acc.indexOf(k)
      if (index !== -1) {
        console.warn(`key[Inject]:${k} has existed, and would be overrided.`)
      }
      acc = acc.concat([k])
    })
    return acc
  }, []))
  Object.assign(this.injects, ...params)
  return this
}

/**
 * add plugins
 * @param {Array} plugins
 * return middles if no params be provided
 * Note:
 * Plugin entity must be a function entity
 */
Juglans.prototype.Use = function (...plugins) {
  assert(plugins.findIndex(x => !is.function(x) && !(is.object(x) && is.function(x.plugin))) === -1, 'plugin entity should be a function or [object] plugin type')
  plugins = plugins
    .map(x => (is.object(x) && is.function(x.plugin) && x.plugin.bind(x)) || x)
    .filter(x => is.function(x))
  this.middles = this.middles.concat(plugins)
  return this
}

/**
 * Run app, qPromise func has some async call in function, those plugins
 * @param {function} cb
 * would be executed in order in synchronization
 * Note:
 * all middles set by `Use` would be run before by setting `Config.depInject`
 */
Juglans.prototype.Run = async function (cb) {
  const LMiddles = [plugins.ProxyRun(cb)]
  const sMiddles = scanPlugins(this.config.depInject)
  this.Use(...sMiddles).Use(...LMiddles)
  return runPlugins(
    this.middles,
    (function (ctx) {
      return function () {
        return ctx.injects
      }
    })(this),
    {
      execAfter: (function (ctx) {
        return ret => {
          if (is.object(ret) && Object.keys(ret).length >= 1) {
            ctx.Inject(ret)
          }
        }
      })(this)
    })
}
module.exports = inherits(Juglans, EventEmitter)
