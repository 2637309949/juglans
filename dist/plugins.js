"use strict";

// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.
const koaRouter = require('koa-router');

const koaBody = require('koa-body');

const https = require('https');

const http = require('http');

const assert = require('assert');

const Koa = require('koa');

const is = require('is');

const grpc = require('grpc');

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
  static PluginsValidOption(plugins) {
    return new options.Option(function (j) {
      assert(plugins.findIndex(x => !is.function(x) && !(is.object(x) && is.function(x.plugin))) === -1, 'plugin entity should be a function or [object] plugin type');
      return plugins.filter(x => is.function(x) || is.object(x) && is.function(x.plugin)).map(x => extWithHook(x));
    });
  }

  static ScanPluginsValidOption(path, opts) {
    const plugins = scanPlugins(path, opts);
    return new options.Option(function (j) {
      assert(plugins.findIndex(x => !is.function(x) && !(is.object(x) && is.function(x.plugin))) === -1, 'plugin entity should be a function or [object] plugin type');
      return plugins.filter(x => is.function(x) || is.object(x) && is.function(x.plugin)).map(x => extWithHook(x));
    });
  }

  Append(src) {
    // return new Plugins(...this.concat(src))
    return this.concat(src);
  }

  static PrePluginsOption(plugins) {
    return new options.Option(function (j) {
      j.lock.acquire('prePlugins', done => {
        j.prePlugins = j.prePlugins.Append(plugins);
        done();
      });
      return j;
    });
  }

  static MiddlePluginsOption(plugins) {
    return new options.Option(function (j) {
      j.lock.acquire('plugins', done => {
        j.plugins = j.plugins.Append(plugins);
        done();
      });
      return j;
    });
  }

  static PostPluginsOption(plugins) {
    return new options.Option(function (j) {
      j.lock.acquire('plugins', done => {
        j.postPlugins = j.postPlugins.Append(plugins);
        done();
      });
      return j;
    });
  }

  static ScanPluginsOption(plugins) {
    return new options.Option(function (j) {
      j.lock.acquire('scanPlugins', done => {
        j.scanPlugins = j.scanPlugins.Append(plugins);
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

repo.GrpcProxy = opts => (_ref3) => {
  let {
    events
  } = _ref3;
  let grpcProxy = opts;

  if (!grpcProxy) {
    grpcProxy = new grpc.Server();
  }

  return {
    grpcProxy
  };
};

repo.HttpRouter = opts => (_ref4) => {
  let {
    httpProxy,
    config: {
      prefix = '/api',
      bodyParser
    } = {}
  } = _ref4;
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

repo.Recovery = (_ref5) => {
  let {
    httpProxy,
    router
  } = _ref5;
  httpProxy.use(recovery());
  router.use(recovery());
};

repo.HTTPBooting = (_ref6) => {
  let {
    events,
    httpProxy,
    grpcProxy,
    config: {
      port = 3000,
      name,
      ENV
    } = {}
  } = _ref6;
  const srv = http.createServer(httpProxy.callback());
  srv.listen(port, err => {
    if (err) {
      logger.error(err);
    }
  });
  grpcProxy.bind(`0.0.0.0:${port + 1}`, grpc.ServerCredentials.createInsecure());
  grpcProxy.start(err => {
    if (err) {
      logger.error(err);
    }
  });
  logger.info(`App:${name}`);
  logger.info(`Env:${ENV}`);
  logger.info(`Http Listen on:${port}`);
  logger.info(`Grpc Listen on:${port + 1}`);
  events.on(EVENTS.EventsShutdown, () => {
    srv.close();
    grpcProxy.close();
  });
};

repo.HTTPTLSBooting = (_ref7) => {
  let {
    events,
    httpProxy,
    grpcProxy,
    config: {
      port = 8043,
      tls,
      name,
      ENV
    }
  } = _ref7;
  const srv = https.createServer(tls, httpProxy.callback());
  srv.listen(port, err => {
    if (err) {
      logger.error(err);
    }
  });
  grpcProxy.bind(`0.0.0.0:${port + 1}`, grpc.ServerCredentials.createInsecure());
  grpcProxy.start(err => {
    if (!err) {
      logger.error(err);
    }
  });
  logger.info(`App:${name}`);
  logger.info(`Env:${ENV}`);
  logger.info(`Http Listen on:${port}`);
  logger.info(`Grpc Listen on:${port + 1}`);
  events.on(EVENTS.EventsShutdown, () => {
    srv.close();
    grpcProxy.close();
  });
};

repo.Running = (_ref8) => {
  let {
    events
  } = _ref8;
  events.emit(EVENTS.EventsRunning, EVENTS.EventsRunning);
};