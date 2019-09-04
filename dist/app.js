"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.
const AsyncLock = require('async-lock');

const deepmerge = require('deepmerge');

const events = require('events');

const only = require('only');

const EVENTS = require('./events');

const assert = require('assert');

const _ = require('lodash');

const is = require('is');

const {
  Empty
} = require('./options');

const plugins = require('./plugins');

const logger = require('./logger');

const {
  Conf
} = require('./conf');

const {
  builtInInjects,
  Injects
} = require('./inejcts');

const {
  runPlugins,
  inherits
} = require('./utils');
/**
 * Juglans constructor.
 * The exports object of the `Juglans` module is an instance of this class.
 * Most apps will only use this one instance.
 *
 * @param {object} configuration app config
 * @param {object} httpProxy as `proxy http`, router as `http hander`
 * @api public
 */


function Juglans() {
  var _this$Clear$Inject$Pr;

  let conf = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  assert(is.object(conf), 'cfg should be a object');
  assert(is.object(opts), 'opts should be a object');

  if (!(this instanceof Juglans)) {
    return new Juglans(conf, opts);
  }

  const {
    httpProxy,
    router
  } = opts;
  conf = _.cloneDeep(conf);
  opts = _.cloneDeep(opts);
  this.env = opts.env || process.env.NODE_ENV || 'development';
  this.opts = opts; // Default global config, injects, plugins

  this.config = new Conf(deepmerge.all([Juglans.defaultConfig, conf])); // default global config, injects, plugins

  this.injects = new Injects(); // default global config, injects, plugins

  this.plugins = new plugins.Plugins(); // default scan plugins

  this.scanPlugins = new plugins.Plugins(); // default pre plugins

  this.prePlugins = new plugins.Plugins(); // default post plugins

  this.postPlugins = new plugins.Plugins(); // Instance lock

  this.lock = new AsyncLock(_.merge({
    timeout: 3000,
    maxPending: 100
  }, opts.lock || {})); // init code

  (_this$Clear$Inject$Pr = this.Clear().Inject(builtInInjects(this)).PreUse(plugins.Starting, plugins.HttpProxy(httpProxy), plugins.HttpRouter(router), plugins.Recovery)).Use.apply(_this$Clear$Inject$Pr, []).PostUse(plugins.Running);
}
/**
 *  Clear defined empty all exists plugin and inject
 *  would return a empty bulrush
 *  should be careful
 */


Juglans.prototype.Clear = function () {
  return Empty().apply(this);
};
/**
 * Sets Juglans config
 *
 * #### Example:
 *     app.Config({ test: '123' })
 *     app.Config({ test: 'test' })
 * All `config` just for plugins, so set your `config` base on your plugins use
 * Note:
 * The same properties will be overridden
 *
 * @param {...Object} parameters
 * @api public
 */


Juglans.prototype.Config = function () {
  for (var _len = arguments.length, parameters = new Array(_len), _key = 0; _key < _len; _key++) {
    parameters[_key] = arguments[_key];
  }

  const cParameters = Conf.ConfValidOption(parameters).check(this);
  return Conf.ConfOption(cParameters).apply(this);
};
/**
 * Acquire Juglans injects
 * Return injects if found, or nothing
 * @param {string} name
 * @api public
 */


Juglans.prototype.Acquire = function (name) {
  return this.injects.Acquire(name);
};
/**
 * Add Juglans injects
 * Return injects if no parameters be provided
 * Note:
 * Inject entity must be a object(uniqueness keys)
 *
 * @param {Array} parameters
 * @api public
 */


Juglans.prototype.Inject = function () {
  for (var _len2 = arguments.length, params = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    params[_key2] = arguments[_key2];
  }

  const cParams = Injects.InjectsValidOption(params).check(this);
  return Injects.InjectsOption(cParams).apply(this);
}; // Return JSON representation.
// We only bother showing settings


Juglans.prototype.ToJSON = function () {
  return only(this, ['config', 'opts', 'env']);
}; // Inspect implementation
// We only bother showing settings


Juglans.prototype.Inspect = function () {
  return this.ToJSON();
}; // Default error handler
// logger with error


Juglans.prototype.OnError = function (err) {
  if (!(err instanceof Error)) throw new TypeError(`non-error thrown: ${err}`);
  if (err.status === 404 || err.expose) return;
  if (this.silent) return;
  const msg = err.stack || err.toString();
  logger.error(`${new Date().toISOString()} ${msg.replace(/^/gm, '  ')}`);
  return this;
};
/**
 * Add Juglans plugins
 * ####Example:
 *     app.ScanUse(path.join(__dirname, '../{models,routes,tasks,openapi}'))
 * Return plugins if no params be provided
 * Note:
 * Plugin entity must be a function entity
 *
 * @param {Array} plugins
 * @api public
 */


Juglans.prototype.ScanUse = function (path) {
  let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    ignore: ['**/node_modules/**']
  };
  const cParams = plugins.Plugins.ScanPluginsValidOption(path, opts).check(this);
  return plugins.Plugins.ScanPluginsOption(cParams).apply(this);
};
/**
 * Add Juglans plugins
 * ####Example:
 *     app.PreUse(async ({ router }) => { router.get(ctx => { ctx.body='hello' }) })
 *     app.PreUse(async ({ httpProxy }) => { httpProxy.use(yourKoaMiddle) })
 * Return plugins if no params be provided
 * Note:
 * Plugin entity must be a function entity
 *
 * @param {Array} plugins
 * @api public
 */


Juglans.prototype.PreUse = function () {
  for (var _len3 = arguments.length, params = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    params[_key3] = arguments[_key3];
  }

  const cParams = plugins.Plugins.PluginsValidOption(params).check(this);
  return plugins.Plugins.PrePluginsOption(cParams).apply(this);
};
/**
 * Add Juglans plugins
 * ####Example:
 *     app.Use(async ({ router }) => { router.get(ctx => { ctx.body='hello' }) })
 *     app.Use(async ({ httpProxy }) => { httpProxy.use(yourKoaMiddle) })
 * Return plugins if no params be provided
 * Note:
 * Plugin entity must be a function entity
 *
 * @param {Array} plugins
 * @api public
 */


Juglans.prototype.Use = function () {
  for (var _len4 = arguments.length, params = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    params[_key4] = arguments[_key4];
  }

  const cParams = plugins.Plugins.PluginsValidOption(params).check(this);
  return plugins.Plugins.MiddlePluginsOption(cParams).apply(this);
};
/**
 * Add Juglans plugins
 * ####Example:
 *     app.PostUse(async ({ router }) => { router.get(ctx => { ctx.body='hello' }) })
 *     app.PostUse(async ({ httpProxy }) => { httpProxy.use(yourKoaMiddle) })
 * Return plugins if no params be provided
 * Note:
 * Plugin entity must be a function entity
 *
 * @param {Array} plugins
 * @api public
 */


Juglans.prototype.PostUse = function () {
  for (var _len5 = arguments.length, params = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    params[_key5] = arguments[_key5];
  }

  const cParams = plugins.Plugins.PluginsValidOption(params).check(this);
  return plugins.Plugins.PostPluginsOption(cParams).apply(this);
}; // GET defined HttpProxy handles
// shortcut method


Juglans.prototype.GET = function (relativePath) {
  for (var _len6 = arguments.length, handlers = new Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
    handlers[_key6 - 1] = arguments[_key6];
  }

  this.Use(function (_ref) {
    let {
      router
    } = _ref;
    router.get.apply(router, [relativePath].concat(handlers));
  });
  return this;
}; // POST defined HttpProxy handles
// shortcut method


Juglans.prototype.POST = function (relativePath) {
  for (var _len7 = arguments.length, handlers = new Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
    handlers[_key7 - 1] = arguments[_key7];
  }

  this.Use(function (_ref2) {
    let {
      router
    } = _ref2;
    router.post.apply(router, [relativePath].concat(handlers));
  });
  return this;
}; // DELETE defined HttpProxy handles
// shortcut method


Juglans.prototype.DELETE = function (relativePath) {
  for (var _len8 = arguments.length, handlers = new Array(_len8 > 1 ? _len8 - 1 : 0), _key8 = 1; _key8 < _len8; _key8++) {
    handlers[_key8 - 1] = arguments[_key8];
  }

  this.Use(function (_ref3) {
    let {
      router
    } = _ref3;
    router.delete.apply(router, [relativePath].concat(handlers));
  });
  return this;
}; // PUT defined HttpProxy handles
// shortcut method


Juglans.prototype.PUT = function (relativePath) {
  for (var _len9 = arguments.length, handlers = new Array(_len9 > 1 ? _len9 - 1 : 0), _key9 = 1; _key9 < _len9; _key9++) {
    handlers[_key9 - 1] = arguments[_key9];
  }

  this.Use(function (_ref4) {
    let {
      router
    } = _ref4;
    router.put.apply(router, [relativePath].concat(handlers));
  });
  return this;
}; // Shutdown defined bul gracefulExit
// ,, close http or other resources
// should call Shutdown after bulrush has running success


Juglans.prototype.Shutdown =
/*#__PURE__*/
_asyncToGenerator(function* () {
  this.emit(EVENTS.EventsShutdown);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
      logger.warn('Shutdown: juglans Closed');
    }, 5 * 1000);
  });
});
/**
 * Run app
 * #### Example:
 *  app.Run()
 * RunPlugins func has some async call in function, those plugins
 * would be executed in order in synchronization
 * Note:
 * all plugins set by `Use` would be run before by setting `Config.scan`
 *
 * @param {function} cb
 * @api public
 */

Juglans.prototype.Run =
/*#__PURE__*/
_asyncToGenerator(function* () {
  let booting = plugins.HTTPBooting;

  if (arguments.length > 0) {
    booting = arguments.length <= 0 ? undefined : arguments[0];
  }

  return this.ExecWithBooting(booting);
});
/**
 * Run app
 * #### Example:
 *  app.Run()
 * RunPlugins func has some async call in function, those plugins
 * would be executed in order in synchronization
 * Note:
 * all plugins set by `Use` would be run before by setting `Config.scan`
 *
 * @param {function} cb
 * @api public
 */

Juglans.prototype.RunTLS =
/*#__PURE__*/
_asyncToGenerator(function* () {
  let booting = plugins.HTTPTLSBooting;

  if (arguments.length > 0) {
    booting = arguments.length <= 0 ? undefined : arguments[0];
  }

  return this.ExecWithBooting(booting);
});
/**
 * ExecWithBooting booting application
 * #### Example:
 *  app.ExecWithBooting(plugins.HTTPBooting)
 * RunPlugins func has some async call in function, those plugins
 * would be executed in order in synchronization
 * Note:
 * all plugins set by `Use` would be run before by setting `Config.scan`
 *
 * @param {function} cb
 * @api public
 */

Juglans.prototype.ExecWithBooting =
/*#__PURE__*/
function () {
  var _ref8 = _asyncToGenerator(function* (b) {
    try {
      const _this = this;

      this.PostUse(b);
      yield runPlugins(this.prePlugins.Append(this.plugins).Append(this.scanPlugins).Append(this.postPlugins), () => this.injects, {
        execAfter(ret) {
          _this.Inject(ret);
        }

      });
    } catch (error) {
      this.OnError(error);
    }
  });

  return function (_x) {
    return _ref8.apply(this, arguments);
  };
}();

module.exports = inherits(Juglans, events.EventEmitter);