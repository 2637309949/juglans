// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

const koaRouter = require('koa-router')
const koaBody = require('koa-body')
const https = require('https')
const http = require('http')
const assert = require('assert')
const Koa = require('koa')
const is = require('is')
const recovery = require('./recovery')
const options = require('./options')
const EVENTS = require('./events')
const logger = require('./logger')
const utils = require('./utils')

const {
  scanPlugins,
  extWithHook
} = require('./utils')

const repo = module.exports

class Plugins extends Array {
  static PluginsValidOption (plugins) {
    return new options.Option(function (j) {
      assert(plugins
        .findIndex(x => !is.function(x) && !(is.object(x) && is.function(x.plugin))) === -1,
      'plugin entity should be a function or [object] plugin type')
      return plugins
        .filter(x => is.function(x) || (is.object(x) && is.function(x.plugin)))
        .map(x => extWithHook(x))
    })
  }

  static ScanPluginsValidOption (path, opts) {
    const plugins = scanPlugins(path, opts)
    return new options.Option(function (j) {
      assert(plugins
        .findIndex(x => !is.function(x) && !(is.object(x) && is.function(x.plugin))) === -1,
      'plugin entity should be a function or [object] plugin type')
      return plugins
        .filter(x => is.function(x) || (is.object(x) && is.function(x.plugin)))
        .map(x => extWithHook(x))
    })
  }

  Append (src) {
    // return new Plugins(...this.concat(src))
    return this.concat(src)
  }

  static PrePluginsOption (plugins) {
    return new options.Option(function (j) {
      j.lock.acquire('prePlugins', done => {
        j.prePlugins = j.prePlugins.Append(plugins)
        done()
      })
      return j
    })
  }

  static MiddlePluginsOption (plugins) {
    return new options.Option(function (j) {
      j.lock.acquire('plugins', done => {
        j.plugins = j.plugins.Append(plugins)
        done()
      })
      return j
    })
  }

  static PostPluginsOption (plugins) {
    return new options.Option(function (j) {
      j.lock.acquire('plugins', done => {
        j.postPlugins = j.postPlugins.Append(plugins)
        done()
      })
      return j
    })
  }

  static ScanPluginsOption (plugins) {
    return new options.Option(function (j) {
      j.lock.acquire('scanPlugins', done => {
        j.scanPlugins = j.scanPlugins.Append(plugins)
        done()
      })
      return j
    })
  }
}

repo.Plugins = Plugins

repo.Starting = ({ events }) => {
  events.emit(EVENTS.Starting, EVENTS.Starting)
}

repo.HttpProxy = opts => ({ events }) => {
  let httpProxy = opts
  if (!httpProxy) {
    httpProxy = utils.proxyWithEvent(new Koa(), events)
  }
  return { httpProxy }
}

repo.HttpRouter = opts => ({ httpProxy, config: { prefix = '/api', bodyParser } }) => {
  let router = opts
  if (!router) {
    router = utils.routerWithLogger(koaRouter({ prefix }), prefix)
    router.use(koaBody(bodyParser))
    httpProxy.use(router.routes())
    httpProxy.use(router.allowedMethods())
  }
  return { router }
}

repo.Recovery = ({httpProxy, router}) => {
  httpProxy.use(recovery())
  router.use(recovery())
}

repo.HTTPBooting = ({ events, httpProxy, config: { port = 3000, name, NODE_ENV } }) => {
  const srv = http.createServer(httpProxy.callback())
  srv.listen(port, err => {
    if (!err) {
      logger.info(`App:${name}`)
      logger.info(`App:${NODE_ENV}`)
      logger.info(`App:runing on Port:${port}`)
    } else {
      logger.error(err)
    }
  })
  events.on(EVENTS.EventsShutdown, () => {
    srv.close()
  })
}

repo.HTTPTLSBooting = ({ events, httpProxy, config: { port = 8043, tls, name, NODE_ENV } }) => {
  const srv = https.createServer(tls, httpProxy.callback())
  srv.listen(port, err => {
    if (!err) {
      logger.info(`App:${name}`)
      logger.info(`App:${NODE_ENV}`)
      logger.info(`App:runing on Port:${port}`)
    } else {
      logger.error(err)
    }
  })
  events.on(EVENTS.EventsShutdown, () => {
    srv.close()
  })
}

repo.Running = ({ events }) => {
  events.emit(EVENTS.EventsRunning, EVENTS.EventsRunning)
}
