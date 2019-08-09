// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

const koaRouter = require('koa-router')
const koaBody = require('koa-body')
const Koa = require('koa')
const recovery = require('./recovery')
const EVENTS = require('./events')
const logger = require('./logger')
const utils = require('./utils')

const repo = module.exports

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

repo.scanPluginsBefore = ({ events }) => {
  events.emit(EVENTS.SYS_JUGLANS_SCAN_BEFORE, EVENTS.SYS_JUGLANS_SCAN_BEFORE)
}

repo.scanPluginsAfter = ({ events }) => {
  events.emit(EVENTS.SYS_JUGLANS_SCAN_AFTER, EVENTS.SYS_JUGLANS_SCAN_AFTER)
}

repo.RunImmediately = ({ httpProxy, config: { port = 3000, name, NODE_ENV } }) => {
  httpProxy.listen(port, err => {
    if (!err) {
      logger.info(`App:${name}`)
      logger.info(`App:${NODE_ENV}`)
      logger.info(`App:runing on Port:${port}`)
    } else {
      logger.error(err)
    }
  })
}
