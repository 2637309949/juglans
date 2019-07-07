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

const logger = require('./logger');

const EVENT = require('./events');

const repo = exports;

repo.extWithHook = function (target) {
  var plugin = target; // bind parent

  if (is.object(plugin)) {
    plugin = plugin.plugin.bind(target);

    if (!plugin.parent) {
      plugin.parent = target;
    }
  } // bind hook


  if (is.function(plugin)) {
    if (!plugin.constructor.prototype.pre) {
      plugin.constructor.prototype.pre = function (fn) {
        const _this = this;

        return (
          /*#__PURE__*/
          _asyncToGenerator(function* () {
            if (is.function(fn)) {
              // never pass arguments!
              yield fn();
            }

            return _this.apply(this, arguments);
          })
        );
      };
    }

    if (!plugin.constructor.prototype.post) {
      plugin.constructor.prototype.post = function (fn) {
        const _this = this;

        return (
          /*#__PURE__*/
          _asyncToGenerator(function* () {
            const result = yield _this.apply(this, arguments);

            if (is.function(fn)) {
              // never pass arguments!
              yield fn();
            }

            return result;
          })
        );
      };
    }
  }

  return plugin;
}; // Scan plugins from spec path


repo.scanPlugins = function () {
  let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    path: []
  };

  try {
    const paths = is.array(options.path) ? options.path : [options.path];
    delete options.path;

    const filePaths = _.flatMap(paths, path => glob.sync(path, options));

    const plugins = filePaths.map(x => require(x)).filter(x => is.function(x) || is.object(x) && is.function(x.plugin)).map(x => repo.extWithHook(x)).filter(x => is.function(x));
    return plugins;
  } catch (error) {
    logger.error(error.stack || error.message);
    throw new Error(`scan injects error:${error.stack}`);
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
    var _ref3 = _asyncToGenerator(function* (acc, curr, index) {
      return Promise.resolve(acc).then(x => {
        if (options.execBefore) options.execBefore(x, index);

        if (options.chainArgs) {
          return curr.pre(curr.parent && curr.parent.pre && curr.parent.pre.bind(curr.parent)).post(curr.parent && curr.parent.post && curr.parent.post.bind(curr.parent))(x);
        } else {
          return curr.pre(curr.parent && curr.parent.pre && curr.parent.pre.bind(curr.parent)).post(curr.parent && curr.parent.post && curr.parent.pre.bind(curr.parent))(is.function(args) ? args() : args);
        }
      }).then(x => {
        if (options.execAfter && is.object(x)) options.execAfter(x, index);
        return x;
      });
    });

    return function (_x, _x2, _x3) {
      return _ref3.apply(this, arguments);
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
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    const callback = args[args.length - 1];

    if (typeof callback === 'function') {
      args[args.length - 1] = function () {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        if (args[0]) {
          events.emit(EVENT.SYS_JUGLANS_PLUGINS_RUNIMMEDIATELY_FAILED, EVENT.SYS_JUGLANS_PLUGINS_RUNIMMEDIATELY_FAILED);
        } else {
          events.emit(EVENT.SYS_JUGLANS_PLUGINS_RUNIMMEDIATELY_SUCCEED, EVENT.SYS_JUGLANS_PLUGINS_RUNIMMEDIATELY_SUCCEED);
        }

        callback.apply(this, args);
      };
    }

    return listen.apply(this, args);
  })(httpProxy.listen);

  return httpProxy;
};