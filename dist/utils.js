"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.
const utils = require('util');

const glob = require('glob');

const _ = require('lodash');

const is = require('is');

const EVENT = require('./events');

const repo = exports; // Scan plugins from spec path

repo.scanPlugins = function () {
  let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    path: []
  };

  try {
    const paths = is.array(options.path) ? options.path : [options.path];
    delete options.path;

    const filePaths = _.flatMap(paths, path => glob.sync(path, options));

    const plugins = filePaths.map(x => require(x)).map(x => is.function(x) && x || x).map(x => is.object(x) && is.function(x.plugin) && x.plugin.bind(x) || x).filter(x => is.function(x));
    return plugins;
  } catch (error) {
    throw new Error(`scan injects error:${error}`);
  }
}; // Execute promise in orderly
// lazy cac, support lazy params cac


repo.runPlugins = function (arrs, args) {
  let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    chainArgs: false,
    execAfter: () => {},
    execBefore: () => {}
  };
  return arrs.reduce(
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(function* (acc, curr, index) {
      return Promise.resolve(acc).then(x => {
        if (options.execBefore) options.execBefore(x, index);

        if (options.chainArgs) {
          return curr(x);
        } else {
          return curr(is.function(args) ? args() : args);
        }
      }).then(x => {
        if (options.execAfter && is.object(x)) options.execAfter(x, index);
        return x;
      });
    });

    return function (_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }(), Promise.resolve(!options.chainArgs && is.function(args) ? args() : args));
}; // Default value


repo.someOrElse = function (value, initValue) {
  if (value) {
    return value;
  } else {
    return initValue;
  }
}; // Inherits object


repo.inherits = function (src, target) {
  utils.inherits(src, target);
  return src;
}; // Return EventEmitter


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
  };
  return EventEmitter;
}; // Return HttpProxy


repo.proxyWithEvent = function (httpProxy, events) {
  httpProxy.listen = (listen => function listenProxy() {
    const _this = this;

    const callback = arguments[arguments.length - 1];

    if (typeof callback === 'function') {
      arguments[arguments.length - 1] = function () {
        const _this = this;

        const _arguments = arguments;
        const err = _arguments[0];

        if (err) {
          events.emit(EVENT.SYS_JUGLANS_PLUGINS_RUNIMMEDIATELY_FAILED, EVENT.SYS_JUGLANS_PLUGINS_RUNIMMEDIATELY_FAILED);
        } else {
          events.emit(EVENT.SYS_JUGLANS_PLUGINS_RUNIMMEDIATELY_SUCCEED, EVENT.SYS_JUGLANS_PLUGINS_RUNIMMEDIATELY_SUCCEED);
        }

        callback.apply(_this, _arguments);
      };
    }

    listen.apply(_this, arguments);
  })(httpProxy.listen);

  return httpProxy;
};