"use strict";

// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.
const koaRouter = require('koa-router');

const koaBody = require('koa-body');

const assert = require('assert');

const Koa = require('koa');

const is = require('is');

const recovery = require('./recovery');

const options = require('./options');

const EVENTS = require('./events');

const logger = require('./logger');

const utils = require('./utils');

const {
  scanPlugins,
  extWithHook
} = require('./utils');

const repo = module.exports;

class Plugins extends Array {
  static PrePluginsOption(plugins) {
    return new options.Option(function (j) {
      assert(plugins.findIndex(x => !is.function(x) && !(is.object(x) && is.function(x.plugin))) === -1, 'plugin entity should be a function or [object] plugin type');
      plugins = plugins.filter(x => is.function(x) || is.object(x) && is.function(x.plugin)).map(x => extWithHook(x)).filter(x => is.function(x));
      j.lock.acquire('preMiddles', done => {
        j.preMiddles = j.preMiddles.concat(plugins);
        done();
      });
      return j;
    });
  }

  static MiddlePluginsOption(plugins) {
    return new options.Option(function (j) {
      assert(plugins.findIndex(x => !is.function(x) && !(is.object(x) && is.function(x.plugin))) === -1, `plugin entity should be a function or [object] plugin type ${plugins}`);
      plugins = plugins.filter(x => is.function(x) || is.object(x) && is.function(x.plugin)).map(x => extWithHook(x));
      j.lock.acquire('middles', done => {
        j.middles = j.middles.concat(plugins);
        done();
      });
      return j;
    });
  }

  static PostPluginsOption(plugins) {
    return new options.Option(function (j) {
      assert(plugins.findIndex(x => !is.function(x) && !(is.object(x) && is.function(x.plugin))) === -1, `plugin entity should be a function or [object] plugin type ${plugins}`);
      plugins = plugins.filter(x => is.function(x) || is.object(x) && is.function(x.plugin)).map(x => extWithHook(x));
      j.lock.acquire('middles', done => {
        j.postMiddles = j.postMiddles.concat(plugins);
        done();
      });
      return j;
    });
  }

  static ScanPluginsOption(path, opts) {
    return new options.Option(function (j) {
      const plugins = scanPlugins(path, opts);
      j.lock.acquire('scanMiddles', done => {
        j.scanMiddles = j.scanMiddles.concat(plugins);
        done();
      });
      return j;
    });
  }

}

repo.Plugins = Plugins;

repo.Starting = (_ref) => {
  let {
    events
  } = _ref;
  events.emit(EVENTS.Starting, EVENTS.Starting);
};

repo.HttpProxy = opts => (_ref2) => {
  let {
    events
  } = _ref2;
  let httpProxy = opts;

  if (!httpProxy) {
    httpProxy = utils.proxyWithEvent(new Koa(), events);
  }

  return {
    httpProxy
  };
};

repo.HttpRouter = opts => (_ref3) => {
  let {
    httpProxy,
    config: {
      prefix = '/api',
      bodyParser
    }
  } = _ref3;
  let router = opts;

  if (!router) {
    router = utils.routerWithLogger(koaRouter({
      prefix
    }), prefix);
    router.use(koaBody(bodyParser));
    httpProxy.use(router.routes());
    httpProxy.use(router.allowedMethods());
  }

  return {
    router
  };
};

repo.Recovery = (_ref4) => {
  let {
    httpProxy,
    router
  } = _ref4;
  httpProxy.use(recovery());
  router.use(recovery());
};

repo.HTTPBooting = (_ref5) => {
  let {
    events,
    httpProxy,
    config: {
      port = 3000,
      name,
      NODE_ENV
    }
  } = _ref5;
  const srv = httpProxy.listen(port, err => {
    if (!err) {
      logger.info(`App:${name}`);
      logger.info(`App:${NODE_ENV}`);
      logger.info(`App:runing on Port:${port}`);
    } else {
      logger.error(err);
    }
  });
  events.on(EVENTS.EventsShutdown, () => {
    srv.close();
  });
};

repo.Running = (_ref6) => {
  let {
    events
  } = _ref6;
  events.emit(EVENTS.EventsRunning, EVENTS.EventsRunning);
};