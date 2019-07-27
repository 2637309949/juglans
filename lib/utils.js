// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

const path = require('path')
const utils = require('util')
const glob = require('glob')
const _ = require('lodash')
const is = require('is')
const logger = require('./logger')
const EVENT = require('./events')
const repo = exports

repo.extWithHook = function (target) {
  var plugin = target

  // bind parent
  if (is.object(plugin)) {
    plugin = plugin.plugin.bind(target)
    if (!plugin.parent) {
      plugin.parent = target
    }
  }

  // bind hook
  if (is.function(plugin)) {
    if (!plugin.constructor.prototype.pre) {
      plugin.constructor.prototype.pre = function (fn) {
        const _this = this
        return async function () {
          if (is.function(fn)) {
            // never pass arguments!
            await fn()
          }
          return _this.apply(this, arguments)
        }
      }
    }
    if (!plugin.constructor.prototype.post) {
      plugin.constructor.prototype.post = function (fn) {
        const _this = this
        return async function () {
          const result = await _this.apply(this, arguments)
          if (is.function(fn)) {
            // never pass arguments!
            await fn()
          }
          return result
        }
      }
    }
  }
  return plugin
}

// Scan plugins from spec path
repo.scanPlugins = function (options = { path: [] }) {
  try {
    const paths = is.array(options.path) ? options.path : [options.path]
    delete options.path
    const filePaths = _.flatMap(paths, path => glob.sync(path, options))
    const plugins = filePaths
      .map(x => require(x))
      .filter(x => is.function(x) || (is.object(x) && is.function(x.plugin)))
      .map(x => repo.extWithHook(x))
      .filter(x => is.function(x))
    return plugins
  } catch (error) {
    logger.error(error.stack || error.message)
    throw new Error(`scan injects error:${error.stack}`)
  }
}

// Execute promise in orderly
// lazy cac, support lazy params cac
repo.runPlugins = function (arrs, args, options = { chainArgs: false, execAfter: () => {}, execBefore: () => {} }) {
  return arrs.reduce(async (acc, curr, index) => {
    return Promise.resolve(acc).then(x => {
      if (options.execBefore) options.execBefore(x, index)
      if (options.chainArgs) {
        return curr.pre(curr.parent && curr.parent.pre && curr.parent.pre.bind(curr.parent)).post(curr.parent && curr.parent.post && curr.parent.post.bind(curr.parent))(x)
      } else {
        return curr.pre(curr.parent && curr.parent.pre && curr.parent.pre.bind(curr.parent)).post(curr.parent && curr.parent.post && curr.parent.pre.bind(curr.parent))(is.function(args) ? args() : args)
      }
    }).then(x => {
      if (options.execAfter && is.object(x)) options.execAfter(x, index)
      return x
    })
  }, Promise.resolve(!options.chainArgs && is.function(args) ? args() : args))
}

// Default value
repo.someOrElse = function (value, initValue) {
  if (value) {
    return value
  } else {
    return initValue
  }
}

// Inherits object
repo.inherits = function (src, target) {
  utils.inherits(src, target)
  return src
}

// Return EventEmitter
repo.EventEmitter = function (juglans) {
  const EventEmitter = {
    addListener: juglans.addListener.bind(juglans),
    on: juglans.on.bind(juglans),
    once: juglans.once.bind(juglans),
    prependListener: juglans.prependListener.bind(juglans),
    prependOnceListener: juglans.prependOnceListener.bind(juglans),
    removeListener: juglans.removeListener.bind(juglans),
    removeAllListeners: juglans.removeAllListeners.bind(juglans),
    setMaxListeners: juglans.setMaxListeners.bind(juglans),
    getMaxListeners: juglans.getMaxListeners.bind(juglans),
    listeners: juglans.listeners.bind(juglans),
    emit: juglans.emit.bind(juglans),
    eventNames: juglans.eventNames.bind(juglans),
    listenerCount: juglans.listenerCount.bind(juglans)
  }
  return EventEmitter
}

// Return HttpProxy
repo.proxyWithEvent = function (httpProxy, events) {
  httpProxy.listen = (listen => function listenProxy (...args) {
    const callback = args[args.length - 1]
    if (typeof callback === 'function') {
      args[args.length - 1] = function (...args) {
        if (args[0]) {
          events.emit(EVENT.SYS_JUGLANS_PLUGINS_HTTPPROXY_LISTEN_FAILED, EVENT.SYS_JUGLANS_PLUGINS_HTTPPROXY_LISTEN_FAILED)
        } else {
          events.emit(EVENT.SYS_JUGLANS_PLUGINS_HTTPPROXY_LISTEN_SUCCEED, EVENT.SYS_JUGLANS_PLUGINS_HTTPPROXY_LISTEN_SUCCEED)
        }
        callback.apply(this, args)
      }
    }
    return listen.apply(this, args)
  })(httpProxy.listen)
  return httpProxy
}

repo.routerWithLogger = function (router, prefix) {
  router.get = (function (get) {
    return function () {
      logger.debug(`GET ${path.join(prefix, arguments[0])}`)
      get.apply(router, arguments)
    }
  })(router.get)
  router.post = (function (post) {
    return function () {
      logger.debug(`POST ${path.join(prefix, arguments[0])}`)
      post.apply(router, arguments)
    }
  })(router.post)
  router.put = (function (put) {
    return function () {
      logger.debug(`PUT ${path.join(prefix, arguments[0])}`)
      put.apply(router, arguments)
    }
  })(router.put)
  router.delete = (function (remove) {
    return function () {
      logger.debug(`DELETE ${path.join(prefix, arguments[0])}`)
      remove.apply(router, arguments)
    }
  })(router.delete)
  return router
}
