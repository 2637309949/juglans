"use strict";

// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.
const koaRouter = require('koa-router');

const koaBody = require('koa-body');

const Koa = require('koa');

const events = require('./events');

const logger = require('./logger');

const utils = require('./utils');

const repo = module.exports;

repo.HttpProxy = httpProxy => (_ref) => {
  let {
    events
  } = _ref;

  if (!httpProxy) {
    httpProxy = new Koa();
    httpProxy = utils.proxyWithEvent(httpProxy, events);
  }

  return {
    httpProxy
  };
};

repo.HttpRouter = router => (_ref2) => {
  let {
    httpProxy,
    config: {
      prefix,
      bodyParser
    }
  } = _ref2;

  if (!router) {
    router = koaRouter({
      prefix: utils.someOrElse(prefix, '/api/v1')
    });
    router.use(koaBody(bodyParser));
    httpProxy.use(router.routes());
    httpProxy.use(router.allowedMethods());
  }

  return {
    router
  };
};

repo.scanPluginsBefore = () => (_ref3) => {
  let {
    events: e
  } = _ref3;
  e.emit(events.SYS_JUGLANS_SCAN_BEFORE, events.SYS_JUGLANS_SCAN_BEFORE);
};

repo.scanPluginsAfter = () => (_ref4) => {
  let {
    events: e
  } = _ref4;
  e.emit(events.SYS_JUGLANS_SCAN_AFTER, events.SYS_JUGLANS_SCAN_AFTER);
}; // The last middles, run RunImmediately
// those middles from code would be call in order


repo.RunImmediately = (_ref5) => {
  let {
    httpProxy,
    config
  } = _ref5;
  httpProxy.listen(utils.someOrElse(config.port, 3000), err => {
    if (!err) {
      logger.info(`App:${config.name}`);
      logger.info(`App:${config.NODE_ENV}`);
      logger.info(`App:runing on Port:${config.port}`);
    } else {
      logger.error(err);
    }
  });
};