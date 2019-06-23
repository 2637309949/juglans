// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

const events = require('events')
const deepmerge = require('deepmerge')
const assert = require('assert')
const _ = require('lodash')
const is = require('is')

const plugins = require('./plugins')
const logger = require('./logger')
const defaultInjects = require('./inejcts')
const {
  inherits,
  runPlugins,
  scanPlugins
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
function Juglans (conf = {}, options = {}) {
  // Legitimacy asserts
  assert(is.object(conf), 'cfg should be a object')
  assert(is.object(options), 'options should be a object')
  // Default global options
  const {httpProxy, router} = options
  if (!(this instanceof Juglans)) {
    return new Juglans(conf, options)
  }
  this.options = options
  // Default global config, injects, middles
  this.config = deepmerge.all([Juglans.defaultConfig, conf])
  // default global config, injects, middles
  this.injects = {}
  // default global config, injects, middles
  this.middles = []
  // default pre middles
  this.preMiddles = []
  // default post middles
  this.postMiddles = []

  // default plugins
  const dMiddles = [plugins.HttpProxy(httpProxy), plugins.HttpRouter(router)]
  // default plugins
  const preMiddles = []
  // default plugins
  const postMiddles = []
  // default injects
  const dInjects = defaultInjects(this)

  this.Inject(dInjects)
  this.PreUse(...preMiddles)
  this.Use(...dMiddles)
  this.PostUse(...postMiddles)
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
  // Refined debug mode
  const debug = parameters.reduce((acc, curr) => (curr.debug || acc), false)
  this.config.debug = debug
  // Legitimacy asserts
  assert(parameters.findIndex(x => !is.object(x)) === -1, 'parameters should be a object')
  // Duplicate checking
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
  this.config = deepmerge.all([this.config, ...parameters])
  this.Inject({ config: this.config })
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
  // Legitimacy asserts
  assert(parameters.findIndex(x => !is.object(x)) === -1, 'parameters should be a object')
  // Duplicate checking
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
  _.assign(this.injects, ...parameters)
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
  // Legitimacy asserts
  assert(plugins.findIndex(x => !is.function(x) && !(is.object(x) && is.function(x.plugin))) === -1,
    'plugin entity should be a function or [object] plugin type')
  // Legitimacy filtering
  plugins = plugins
    .map(x => (is.object(x) && is.function(x.plugin) && x.plugin.bind(x)) || x)
    .filter(x => is.function(x))
  this.preMiddles = this.preMiddles.concat(plugins)
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
  // Legitimacy asserts
  assert(plugins.findIndex(x => !is.function(x) && !(is.object(x) && is.function(x.plugin))) === -1,
    'plugin entity should be a function or [object] plugin type')
  // Legitimacy filtering
  plugins = plugins
    .map(x => (is.object(x) && is.function(x.plugin) && x.plugin.bind(x)) || x)
    .filter(x => is.function(x))
  this.middles = this.middles.concat(plugins)
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
  // Legitimacy asserts
  assert(plugins.findIndex(x => !is.function(x) && !(is.object(x) && is.function(x.plugin))) === -1,
    'plugin entity should be a function or [object] plugin type')
  // Legitimacy filtering
  plugins = plugins
    .map(x => (is.object(x) && is.function(x.plugin) && x.plugin.bind(x)) || x)
    .filter(x => is.function(x))
  this.postMiddles = this.postMiddles.concat(plugins)
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
  const _this = this
  const sMiddles = scanPlugins(this.config.scan)
  this.Use(...sMiddles)
  await runPlugins([...this.preMiddles, ...this.middles, ...this.postMiddles], () => this.injects,
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
}

module.exports = inherits(Juglans, events.EventEmitter)
