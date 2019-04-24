/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-05 03:10:49
 * @modify date 2019-01-05 03:10:49
 * @desc [Juglans FrameWork Instance]
 */

const { EventEmitter } = require('events')
const deepmerge = require('deepmerge')
const assert = require('assert')
const is = require('is')

const plugins = require('./plugins')
const { scanPlugins, runPlugins, inherits } = require('./utils')

/**
 * Juglans constructor.
 *
 * The exports object of the `Juglans` module is an instance of this class.
 * Most apps will only use this one instance.
 *
 * @param {object} configuration app config
 * @param {object} httpProxy as `proxy http`, router as `http hander`
 * @api public
 */
function Juglans (configuration = {}, options = {}) {
  // Legitimacy asserts
  assert(is.object(configuration), 'configuration should be a object')
  assert(is.object(options), 'options should be a object')

  // Default global options
  const {httpProxy, router} = options
  if (!(this instanceof Juglans)) {
    return new Juglans(configuration, options)
  }

  // Default global config, injects, middles
  Object.defineProperty(this, 'config', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: {
      name: 'Juglans V1.0',
      prefix: '/api/v1',
      port: 3000,
      debug: true,
      logger: { service: 'Juglans V1.0', maxsize: 10 * 1024, path: '' },
      bodyParser: {
        strict: false,
        jsonLimit: '5mb',
        formLimit: '1mb',
        textLimit: '1mb',
        multipart: true,
        formidable: {
          keepExtensions: true
        }
      }
    }
  })

  // default global config, injects, middles
  Object.defineProperty(this, 'injects', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: {}
  })

  // default global config, injects, middles
  Object.defineProperty(this, 'middles', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: []
  })

  // default plugins
  const dMiddles = [plugins.HttpProxy(httpProxy), plugins.HttpRouter(router)]
  this.Use(...dMiddles)
  this.Config(configuration)
}

/**
 * Sets Juglans config
 *
 * #### Example:
 *
 *     app.Config({ test: '123' })
 *     app.Config({ test: 'test' })
 *
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
    Object.keys(curr).forEach(k => {
      const index = acc.indexOf(k)
      if (index !== -1 && this.config.debug) {
        console.warn(`key[Config]:${k} has existed, the same properties will be overridden.`)
      }
      acc = acc.concat([k])
    })
    return acc
  }, parameters.reduce((acc, curr) => {
    Object.keys(curr).forEach(k => {
      const index = acc.indexOf(k)
      if (index !== -1 && this.config.debug) {
        console.warn(`key[Config]:${k} has existed, the same properties will be overridden.`)
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
 *
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
    Object.keys(curr).forEach(k => {
      const index = acc.indexOf(k)
      if (index !== -1 && this.config.debug) {
        console.warn(`key[Inject]:${k} has existed, the same properties will be overridden.`)
      }
      acc = acc.concat([k])
    })
    return acc
  }, parameters.reduce((acc, curr) => {
    Object.keys(curr).forEach(k => {
      const index = acc.indexOf(k)
      if (index !== -1 && this.config.debug) {
        console.warn(`key[Inject]:${k} has existed, the same properties will be overridden.`)
      }
      acc = acc.concat([k])
    })
    return acc
  }, []))
  Object.assign(this.injects, ...parameters)
  return this
}

/**
 * Add Juglans plugins
 *
 * ####Example:
 *
 *     app.Use(async ({ router }) => { router.get(ctx => { ctx.body='hello' }) })
 *     app.Use(async ({ httpProxy }) => { httpProxy.use(yourKoaMiddle) })
 *
 * Return middles if no params be provided
 * Note:
 * Plugin entity must be a function entity
 *
 * @param {Array} plugins
 * @api public
 */
Juglans.prototype.Use = function (...plugins) {
  // Legitimacy asserts
  assert(plugins.findIndex(x => !is.function(x) && !(is.object(x) && is.function(x.plugin))) === -1, 'plugin entity should be a function or [object] plugin type')
  // Legitimacy filtering
  plugins = plugins
    .map(x => (is.object(x) && is.function(x.plugin) && x.plugin.bind(x)) || x)
    .filter(x => is.function(x))
  this.middles = this.middles.concat(plugins)
  return this
}

/**
 * Run app
 *
 * #### Example:
 *
 *  app.Run(function (err, config) {
 *     if (!err) {
 *        console.log(`App:${config.name}`)
 *        console.log(`App:${config.NODE_ENV}`)
 *        console.log(`App:runing on Port:${config.port}`)
 *     } else {
 *        console.error(err)
 *     }
 *  })
 *
 * RunPlugins func has some async call in function, those plugins
 * would be executed in order in synchronization
 * Note:
 * all middles set by `Use` would be run before by setting `Config.dependency`
 *
 * @param {function} cb
 * @api public
 */
Juglans.prototype.Run = async function (cb = () => {}) {
  const LMiddles = [plugins.ProxyRun(cb)]
  const sMiddles = scanPlugins(this.config.dependency)
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
