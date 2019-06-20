// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

const utils = require('util')
const glob = require('glob')
const _ = require('lodash')
const is = require('is')
const EVENT = require('./events')
const repo = exports

// Scan plugins from spec path
repo.scanPlugins = function (options = { path: [] }) {
  try {
    const paths = is.array(options.path) ? options.path : [options.path]
    delete options.path
    const filePaths = _.flatMap(paths, path => glob.sync(path, options))
    const plugins = filePaths
      .map(x => require(x))
      .map(x => (is.function(x) && x) || x)
      .map(x => (is.object(x) && is.function(x.plugin) && x.plugin.bind(x)) || x)
      .filter(x => is.function(x))
    return plugins
  } catch (error) {
    throw new Error(`scan injects error:${error}`)
  }
}

// Execute promise in orderly
// lazy cac, support lazy params cac
repo.runPlugins = function (arrs, args, options = { chainArgs: false, execAfter: () => {}, execBefore: () => {} }) {
  return arrs.reduce(async (acc, curr, index) => {
    return Promise.resolve(acc).then(x => {
      if (options.execBefore) options.execBefore(x, index)
      if (options.chainArgs) {
        return curr(x)
      } else {
        return curr(is.function(args) ? args() : args)
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
          events.emit(EVENT.SYS_JUGLANS_PLUGINS_RUNIMMEDIATELY_FAILED, EVENT.SYS_JUGLANS_PLUGINS_RUNIMMEDIATELY_FAILED)
        } else {
          events.emit(EVENT.SYS_JUGLANS_PLUGINS_RUNIMMEDIATELY_SUCCEED, EVENT.SYS_JUGLANS_PLUGINS_RUNIMMEDIATELY_SUCCEED)
        }
        callback.apply(this, args)
      }
    }
    return listen.apply(this, args)
  })(httpProxy.listen)
  return httpProxy
}
