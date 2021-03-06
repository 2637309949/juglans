// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

const AsyncLock = require('async-lock')
// const deepmerge = require('deepmerge')
const events = require('events')
const only = require('only')
const assert = require('assert')
const _ = require('lodash')
const is = require('is')

const Lifecycle = require('./lifecycle')
const {Empty} = require('./options')
const plugins = require('./plugins')
const logger = require('./logger')
const { Conf } = require('./conf')
const {builtInInjects, Injects} = require('./inejcts')

const {
  runPlugins,
  inherits,
  withTimeout
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
function Juglans (opts = {}) {
  assert(is.object(opts), 'opts should be a object')
  if (!(this instanceof Juglans)) {
    return new Juglans(opts)
  }
  opts = _.cloneDeep(opts)

  this.env = opts.env || process.env.NODE_ENV || 'development'
  this.opts = opts
  // Default global config, injects, plugins
  this.config = new Conf(Juglans.defaultConfig)
  // default global config, injects, plugins
  this.injects = new Injects()
  // default global config, injects, plugins
  this.plugins = new plugins.Plugins()
  // default scan plugins
  this.scanPlugins = new plugins.Plugins()
  // default pre plugins
  this.prePlugins = new plugins.Plugins()
  // default post plugins
  this.postPlugins = new plugins.Plugins()
  // Instance lock
  this.lock = new AsyncLock(_.merge({timeout: 3000, maxPending: 100}, opts.lock || {}))
  // lifecycle
  this.lifecycle = new Lifecycle()
  // init code
  this.Empty()
    .Inject(builtInInjects(this))
    .PreUse(plugins.Starting)
    .PostUse(plugins.Running)
}

/**
 *  Default defined return common instance
 */
Juglans.Default = function (opts = {}) {
  assert(is.object(opts), 'opts should be a object')
  opts = _.cloneDeep(opts)
  const jug = Juglans(opts)
  jug.PreUse(plugins.HttpProxy(), plugins.GrpcProxy(), plugins.HttpRouter(), plugins.Recovery)
  return jug
}

/**
 *  Empty defined empty all exists plugin and inject
 *  would return a empty bulrush
 *  should be careful
 */
Juglans.prototype.Empty = function () {
  return Empty().apply(this)
}

/**
 * Sets Juglans config
 *
 * #### Example:
 *     app.Config({ test: '123' })
 *     app.Config({ test: 'test' })
 * All `config` just for plugins, so set your `config` base on your plugins use
 * Note:
 * The same properties will be overridden
 *
 * @param {...Object} parameters
 * @api public
 */
Juglans.prototype.Config = function (...parameters) {
  const cParameters = Conf
    .ConfValidOption(parameters)
    .check(this)
  return Conf.ConfOption(cParameters).apply(this)
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
Juglans.prototype.Inject = function (...params) {
  const cParams = Injects
    .InjectsValidOption(params)
    .check(this)
  return Injects.InjectsOption(cParams).apply(this)
}

// Return JSON representation.
// We only bother showing settings
Juglans.prototype.ToJSON = function () {
  return only(this, [
    'config',
    'opts',
    'env'
  ])
}

// Inspect implementation
// We only bother showing settings
Juglans.prototype.Inspect = function () {
  console.log(JSON.stringify(this.ToJSON(), null, 2))
}

// Default error handler
// logger with error
Juglans.prototype.OnError = function (err) {
  if (!(err instanceof Error)) throw new TypeError(`non-error thrown: ${err}`)
  if (err.status === 404 || err.expose) return
  if (this.silent) return
  const msg = err.stack || err.toString()
  logger.error(`${new Date().toISOString()} ${msg.replace(/^/gm, '  ')}`)
  return this
}

/**
 * Add Juglans plugins
 * ####Example:
 *     app.ScanUse(path.join(__dirname, '../{models,routes,tasks,openapi}'))
 * Return plugins if no params be provided
 * Note:
 * Plugin entity must be a function entity
 *
 * @param {Array} plugins
 * @api public
 */
Juglans.prototype.ScanUse = function (path, opts = { ignore: [ '**/node_modules/**' ] }) {
  const cParams = plugins
    .Plugins
    .ScanPluginsValidOption(path, opts)
    .check(this)
  return plugins.Plugins.ScanPluginsOption(cParams).apply(this)
}

/**
 * Add Juglans plugins
 * ####Example:
 *     app.PreUse(async ({ router }) => { router.get(ctx => { ctx.body='hello' }) })
 *     app.PreUse(async ({ httpProxy }) => { httpProxy.use(yourKoaMiddle) })
 * Return plugins if no params be provided
 * Note:
 * Plugin entity must be a function entity
 *
 * @param {Array} plugins
 * @api public
 */
Juglans.prototype.PreUse = function (...params) {
  const cParams = plugins
    .Plugins
    .PluginsValidOption(params)
    .check(this)
  return plugins.Plugins.PrePluginsOption(cParams).apply(this)
}

/**
 * Add Juglans plugins
 * ####Example:
 *     app.Use(async ({ router }) => { router.get(ctx => { ctx.body='hello' }) })
 *     app.Use(async ({ httpProxy }) => { httpProxy.use(yourKoaMiddle) })
 * Return plugins if no params be provided
 * Note:
 * Plugin entity must be a function entity
 *
 * @param {Array} plugins
 * @api public
 */
Juglans.prototype.Use = function (...params) {
  const cParams = plugins
    .Plugins
    .PluginsValidOption(params)
    .check(this)
  return plugins.Plugins.MiddlePluginsOption(cParams).apply(this)
}

/**
 * Add Juglans plugins
 * ####Example:
 *     app.PostUse(async ({ router }) => { router.get(ctx => { ctx.body='hello' }) })
 *     app.PostUse(async ({ httpProxy }) => { httpProxy.use(yourKoaMiddle) })
 * Return plugins if no params be provided
 * Note:
 * Plugin entity must be a function entity
 *
 * @param {Array} plugins
 * @api public
 */
Juglans.prototype.PostUse = function (...params) {
  const cParams = plugins
    .Plugins
    .PluginsValidOption(params)
    .check(this)
  return plugins.Plugins.PostPluginsOption(cParams).apply(this)
}

// GET defined HttpProxy handles
// shortcut method
Juglans.prototype.GET = function (relativePath, ...handlers) {
  this.Use(function ({router}) {
    router.get(relativePath, ...handlers)
  })
  return this
}

// POST defined HttpProxy handles
// shortcut method
Juglans.prototype.POST = function (relativePath, ...handlers) {
  this.Use(function ({router}) {
    router.post(relativePath, ...handlers)
  })
  return this
}

// DELETE defined HttpProxy handles
// shortcut method
Juglans.prototype.DELETE = function (relativePath, ...handlers) {
  this.Use(function ({router}) {
    router.delete(relativePath, ...handlers)
  })
  return this
}

// PUT defined HttpProxy handles
// shortcut method
Juglans.prototype.PUT = function (relativePath, ...handlers) {
  this.Use(function ({router}) {
    router.put(relativePath, ...handlers)
  })
  return this
}

// Shutdown defined bul gracefulExit
// ,, close http or other resources
// should call Shutdown after bulrush has running success
Juglans.prototype.Shutdown = async function () {
  await withTimeout(null, this.lifecycle.Stop)
}

/**
 * Run app
 * #### Example:
 *  app.Run()
 * RunPlugins func has some async call in function, those plugins
 * would be executed in order in synchronization
 * Note:
 * all plugins set by `Use` would be run before by setting `Config.scan`
 *
 * @param {function} cb
 * @api public
 */
Juglans.prototype.Run = async function (...b) {
  let booting = plugins.HTTPBooting
  if (b.length > 0) {
    booting = b[0]
  }
  return this.ExecWithBooting(booting)
}

/**
 * Run app
 * #### Example:
 *  app.Run()
 * RunPlugins func has some async call in function, those plugins
 * would be executed in order in synchronization
 * Note:
 * all plugins set by `Use` would be run before by setting `Config.scan`
 *
 * @param {function} cb
 * @api public
 */
Juglans.prototype.RunTLS = async function (...b) {
  let booting = plugins.HTTPTLSBooting
  if (b.length > 0) {
    booting = b[0]
  }
  return this.ExecWithBooting(booting)
}

/**
 * ExecWithBooting booting application
 * #### Example:
 *  app.ExecWithBooting(plugins.HTTPBooting)
 * RunPlugins func has some async call in function, those plugins
 * would be executed in order in synchronization
 * Note:
 * all plugins set by `Use` would be run before by setting `Config.scan`
 *
 * @param {function} cb
 * @api public
 */
Juglans.prototype.ExecWithBooting = async function (b) {
  const _this = this
  try {
    _this.PostUse(b)
    const plugins = _this.prePlugins.Append(_this.plugins).Append(_this.scanPlugins).Append(_this.postPlugins)
    await runPlugins(plugins,
      () => _this.injects,
      {
        execAfter (ret) {
          _this.Inject(ret)
        }
      })
    await withTimeout(null, _this.lifecycle.Start)
  } catch (error) {
    _this.OnError(error)
  }
}

module.exports = inherits(Juglans, events.EventEmitter)
