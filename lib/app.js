// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

const AsyncLock = require('async-lock')
const deepmerge = require('deepmerge')
const events = require('events')
const EVENTS = require('./events')
const assert = require('assert')
const _ = require('lodash')
const is = require('is')

const {Empty} = require('./options')
const plugins = require('./plugins')
const logger = require('./logger')
const { Conf } = require('./conf')
const {builtInInjects, Injects} = require('./inejcts')

const {
  runPlugins,
  inherits
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
  this.injects = new Injects()
  // default global config, injects, middles
  this.middles = new plugins.Plugins()
  // default scan middles
  this.scanMiddles = new plugins.Plugins()
  // default pre middles
  this.preMiddles = new plugins.Plugins()
  // default post middles
  this.postMiddles = new plugins.Plugins()
  // Instance lock
  this.lock = new AsyncLock(_.merge({timeout: 3000, maxPending: 100}, opts.lock || {}))
  // init code
  this.Clear()
    .Inject(builtInInjects(this))
    .PreUse(plugins.Starting, plugins.HttpProxy(httpProxy), plugins.HttpRouter(router), plugins.Recovery)
    .Use(...[])
    .PostUse(plugins.Running)
}

/**
 *  Clear defined empty all exists plugin and inject
 *  would return a empty bulrush
 *  should be careful
 */
Juglans.prototype.Clear = function () {
  return Empty().apply(this)
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
  return Conf.ConfOption(parameters).apply(this)
}

/**
 * Acquire Juglans injects
 * Return injects if found, or nothing
 * @param {string} name
 * @api public
 */
Juglans.prototype.Acquire = function (name) {
  return this.injects.Acquire(name)
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
  return Injects.InjectsOption(parameters).apply(this)
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
  return plugins.Plugins.ScanPluginsOption(path, opts).apply(this)
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
Juglans.prototype.PreUse = function (...params) {
  return plugins.Plugins.PrePluginsOption(params).apply(this)
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
Juglans.prototype.Use = function (...params) {
  return plugins.Plugins.MiddlePluginsOption(params).apply(this)
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
Juglans.prototype.PostUse = function (...params) {
  return plugins.Plugins.PostPluginsOption(params).apply(this)
}

// Shutdown defined bul gracefulExit
// ,, close http or other resources
// should call Shutdown after bulrush has running success
Juglans.prototype.Shutdown = async function () {
  this.emit(EVENTS.EventsShutdown)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
      logger.warn('Shutdown: juglans Closed')
    }, 5 * 1000)
  })
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
  return this.Run(plugins.HTTPBooting)
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
    this.Use(..._this.scanMiddles)
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
