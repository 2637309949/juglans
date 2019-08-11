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
  const srv = httpProxy.listen(port, err => {
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
