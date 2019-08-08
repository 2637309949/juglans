// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

const AsyncLock = require('async-lock')
const deepmerge = require('deepmerge')
const events = require('events')
const assert = require('assert')
const _ = require('lodash')
const is = require('is')

const plugins = require('./plugins')
const logger = require('./logger')
const defaultInjects = require('./inejcts')

const {
  inherits,
  runPlugins,
  scanPlugins,
  extWithHook
} = require('./utils')

/**
 * Juglans constructor.
 * The exports object of the `Juglans` module is an instance of this class.
 * Most apps will only use this one instance.
 *
 * @param {object} configuration app config
 * @param {object} httpProxy as `proxy http`, router as `http hander`
 * @api public
 */
function Juglans (conf = {}, opts = {}) {
  assert(is.object(conf), 'cfg should be a object')
  assert(is.object(opts), 'opts should be a object')
  if (!(this instanceof Juglans)) {
    return new Juglans(conf, opts)
  }
  const {httpProxy, router} = opts
  conf = _.cloneDeep(conf)
  opts = _.cloneDeep(opts)

  this.opts = opts
  // Default global config, injects, middles
  this.config = deepmerge.all([Juglans.defaultConfig, conf])
  // default global config, injects, middles
  this.injects = {}
  // default global config, injects, middles
  this.middles = []
  // default scan middles
  this.scanMiddles = []
  // default pre middles
  this.preMiddles = []
  // default post middles
  this.postMiddles = []
  // Instance lock
  this.lock = new AsyncLock(_.merge({timeout: 3000, maxPending: 100}, opts.lock || {}))
  // init code
  this.Clear()
    .Inject(defaultInjects(this))
    .PreUse(plugins.HttpProxy(httpProxy), plugins.HttpRouter(router))
    .Use(...[])
    .PostUse(...[])
}

/**
 *  Clear defined empty all exists plugin and inject
 *  would return a empty bulrush
 *  should be careful
 */
Juglans.prototype.Clear = function () {
  this.injects = {}
  this.middles = []
  this.preMiddles = []
  this.postMiddles = []
  return this
}

/**
 * Sets Juglans config
 *
 * #### Example:
 *     app.Config({ test: '123' })
 *     app.Config({ test: 'test' })
 * All `config` just for middles, so set your `config` base on your middles use
 * Note:
 * The same properties will be overridden
 *
 * @param {...Object} parameters
 * @api public
 */
Juglans.prototype.Config = function (...parameters) {
  parameters = parameters.map(x => _.cloneDeep(x))

  const debug = parameters.reduce((acc, curr) => (curr.debug || acc), false)
  this.config.debug = debug
  assert(parameters.findIndex(x => !is.object(x)) === -1, 'parameters should be a object')

  const configs = [this.config]
  configs.reduce((acc, curr) => {
    _.keys(curr).forEach(k => {
      const index = acc.indexOf(k)
      if (index !== -1 && this.config.debug) {
        logger.warn(`[Config]:key[${k}] has existed, the same properties will be overridden.`)
      }
      acc = acc.concat([k])
    })
    return acc
  }, parameters.reduce((acc, curr) => {
    _.keys(curr).forEach(k => {
      const index = acc.indexOf(k)
      if (index !== -1 && this.config.debug) {
        logger.warn(`[Config]:key[${k}] has existed, the same properties will be overridden.`)
      }
      acc = acc.concat([k])
    })
    return acc
  }, []))

  this.lock.acquire('config', done => {
    this.config = deepmerge.all([this.config, ...parameters])
    this.Inject({ config: this.config })
    done()
  })
  return this
}

/**
 * Add Juglans injects
 * Return injects if no parameters be provided
 * Note:
 * Inject entity must be a object(uniqueness keys)
 *
 * @param {Array} parameters
 * @api public
 */
Juglans.prototype.Inject = function (...parameters) {
  assert(parameters.findIndex(x => !is.object(x)) === -1, 'parameters should be a object')
  const injects = [this.injects]
  injects.reduce((acc, curr) => {
    _.keys(curr).forEach(k => {
      const index = acc.indexOf(k)
      if (index !== -1 && this.config.debug) {
        throw new Error(`[Inject]:key[${k}] has existed, the same properties will be overridden.`)
      }
      acc = acc.concat([k])
    })
    return acc
  }, parameters.reduce((acc, curr) => {
    _.keys(curr).forEach(k => {
      const index = acc.indexOf(k)
      if (index !== -1 && this.config.debug) {
        throw new Error(`[Inject]:key[${k}] has existed, the same properties will be overridden.`)
      }
      acc = acc.concat([k])
    })
    return acc
  }, []))

  this.lock.acquire('injects', done => {
    _.assign(this.injects, ...parameters)
    done()
  })
  return this
}

/**
 * Add Juglans plugins
 * ####Example:
 *     app.ScanUse(path.join(__dirname, '../{models,routes,tasks,openapi}'))
 * Return middles if no params be provided
 * Note:
 * Plugin entity must be a function entity
 *
 * @param {Array} plugins
 * @api public
 */
Juglans.prototype.ScanUse = function (path, opts = { ignore: [ '**/node_modules/**' ] }) {
  const plugins = scanPlugins(path, opts)
  this.lock.acquire('scanMiddles', done => {
    this.scanMiddles = this.scanMiddles.concat(plugins)
    done()
  })
  return this
}

/**
 * Add Juglans plugins
 * ####Example:
 *     app.PreUse(async ({ router }) => { router.get(ctx => { ctx.body='hello' }) })
 *     app.PreUse(async ({ httpProxy }) => { httpProxy.use(yourKoaMiddle) })
 * Return middles if no params be provided
 * Note:
 * Plugin entity must be a function entity
 *
 * @param {Array} plugins
 * @api public
 */
Juglans.prototype.PreUse = function (...plugins) {
  assert(plugins
    .findIndex(x => !is.function(x) && !(is.object(x) && is.function(x.plugin))) === -1,
  'plugin entity should be a function or [object] plugin type')

  plugins = plugins
    .filter(x => is.function(x) || (is.object(x) && is.function(x.plugin)))
    .map(x => extWithHook(x))
    .filter(x => is.function(x))

  this.lock.acquire('preMiddles', done => {
    this.preMiddles = this.preMiddles.concat(plugins)
    done()
  })
  return this
}

/**
 * Add Juglans plugins
 * ####Example:
 *     app.Use(async ({ router }) => { router.get(ctx => { ctx.body='hello' }) })
 *     app.Use(async ({ httpProxy }) => { httpProxy.use(yourKoaMiddle) })
 * Return middles if no params be provided
 * Note:
 * Plugin entity must be a function entity
 *
 * @param {Array} plugins
 * @api public
 */
Juglans.prototype.Use = function (...plugins) {
  assert(plugins.findIndex(x => !is.function(x) && !(is.object(x) && is.function(x.plugin))) === -1,
    `plugin entity should be a function or [object] plugin type ${plugins}`)

  plugins = plugins
    .filter(x => is.function(x) || (is.object(x) && is.function(x.plugin)))
    .map(x => extWithHook(x))

  this.lock.acquire('middles', done => {
    this.middles = this.middles.concat(plugins)
    done()
  })
  return this
}

/**
 * Add Juglans plugins
 * ####Example:
 *     app.PostUse(async ({ router }) => { router.get(ctx => { ctx.body='hello' }) })
 *     app.PostUse(async ({ httpProxy }) => { httpProxy.use(yourKoaMiddle) })
 * Return middles if no params be provided
 * Note:
 * Plugin entity must be a function entity
 *
 * @param {Array} plugins
 * @api public
 */
Juglans.prototype.PostUse = function (...plugins) {
  assert(plugins.findIndex(x => !is.function(x) && !(is.object(x) && is.function(x.plugin))) === -1,
    'plugin entity should be a function or [object] plugin type')

  plugins = plugins
    .filter(x => is.function(x) || (is.object(x) && is.function(x.plugin)))
    .map(x => extWithHook(x))

  this.lock.acquire('postMiddles', done => {
    this.postMiddles = this.postMiddles.concat(plugins)
    done()
  })
  return this
}

/**
 * Run app
 * #### Example:
 *  app.RunImmediately()
 * RunPlugins func has some async call in function, those plugins
 * would be executed in order in synchronization
 * Note:
 * all middles set by `Use` would be run before by setting `Config.scan`
 *
 * @param {function} cb
 * @api public
 */
Juglans.prototype.RunImmediately = async function () {
  return this.Run(plugins.RunImmediately)
}

/**
 * Run app
 * #### Example:
 *  app.Run(function (err, config) {
 *     if (!err) {
 *        console.log(`App:${config.name}`)
 *        console.log(`App:${config.NODE_ENV}`)
 *        console.log(`App:runing on Port:${config.port}`)
 *     } else {
 *        console.error(err)
 *     }
 *  })
 * RunPlugins func has some async call in function, those plugins
 * would be executed in order in synchronization
 * Note:
 * all middles set by `Use` would be run before by setting `Config.scan`
 *
 * @param {function} cb
 * @api public
 */
Juglans.prototype.Run = async function (cb) {
  try {
    const _this = this
    this.Use(plugins.scanPluginsBefore)
    this.Use(..._this.scanMiddles)
    this.Use(plugins.scanPluginsAfter)

    await runPlugins([..._this.preMiddles, ..._this.middles, ..._this.postMiddles], () => _this.injects,
      {
        execAfter (ret) {
          _this.Inject(ret)
        }
      }
    )
    if (!is.function(cb)) {
      return this.injects
    }
    cb(this.injects)
  } catch (error) {
    logger.error(`${new Date().toISOString()} panic recovered:\n${error.stack || error.message || error}`)
  }
}

module.exports = inherits(Juglans, events.EventEmitter)
