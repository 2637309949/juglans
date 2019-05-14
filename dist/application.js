"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-05 03:10:49
 * @modify date 2019-01-05 03:10:49
 * @desc [Juglans FrameWork Instance]
 */
const events = require('events');

const deepmerge = require('deepmerge');

const assert = require('assert');

const is = require('is');

const plugins = require('./plugins');

const defaultCfg = require('./cfg');

const {
  scanPlugins,
  runPlugins,
  inherits,
  EventEmitter
} = require('./utils');
/**
 * Juglans constructor.
 *
 * The exports object of the `Juglans` module is an instance of this class.
 * Most apps will only use this one instance.
 *
 * @param {object} configuration app config
 * @param {object} httpProxy as `proxy http`, router as `http hander`
 * @api public
 */


function Juglans() {
  let configuration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  // Legitimacy asserts
  assert(is.object(configuration), 'configuration should be a object');
  assert(is.object(options), 'options should be a object'); // Default global options

  const {
    httpProxy,
    router
  } = options;

  if (!(this instanceof Juglans)) {
    return new Juglans(configuration, options);
  } // Default global config, injects, middles


  this.config = defaultCfg; // default global config, injects, middles

  this.injects = {}; // default global config, injects, middles

  this.middles = []; // default plugins

  const dMiddles = [plugins.HttpProxy(httpProxy), plugins.HttpRouter(router)]; // default Injects

  const dInjects = {
    events: EventEmitter(this)
  };
  this.Inject(dInjects);
  this.Use.apply(this, dMiddles);
  this.Config(configuration);
}
/**
 * Sets Juglans config
 *
 * #### Example:
 *
 *     app.Config({ test: '123' })
 *     app.Config({ test: 'test' })
 *
 * All `config` just for middles, so set your `config` base on your middles use
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

  // Refined debug mode
  const debug = parameters.reduce((acc, curr) => curr.debug || acc, false);
  this.config.debug = debug; // Legitimacy asserts

  assert(parameters.findIndex(x => !is.object(x)) === -1, 'parameters should be a object'); // Duplicate checking

  const configs = [this.config];
  configs.reduce((acc, curr) => {
    Object.keys(curr).forEach(k => {
      const index = acc.indexOf(k);

      if (index !== -1 && this.config.debug) {
        console.warn(`key[Config]:${k} has existed, the same properties will be overridden.`);
      }

      acc = acc.concat([k]);
    });
    return acc;
  }, parameters.reduce((acc, curr) => {
    Object.keys(curr).forEach(k => {
      const index = acc.indexOf(k);

      if (index !== -1 && this.config.debug) {
        console.warn(`key[Config]:${k} has existed, the same properties will be overridden.`);
      }

      acc = acc.concat([k]);
    });
    return acc;
  }, []));
  this.config = deepmerge.all([this.config].concat(parameters));
  this.Inject({
    config: this.config
  });
  return this;
};
/**
 * Add Juglans injects
 *
 * Return injects if no parameters be provided
 * Note:
 * Inject entity must be a object(uniqueness keys)
 *
 * @param {Array} parameters
 * @api public
 */


Juglans.prototype.Inject = function () {
  for (var _len2 = arguments.length, parameters = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    parameters[_key2] = arguments[_key2];
  }

  // Legitimacy asserts
  assert(parameters.findIndex(x => !is.object(x)) === -1, 'parameters should be a object'); // Duplicate checking

  const injects = [this.injects];
  injects.reduce((acc, curr) => {
    Object.keys(curr).forEach(k => {
      const index = acc.indexOf(k);

      if (index !== -1 && this.config.debug) {
        console.warn(`key[Inject]:${k} has existed, the same properties will be overridden.`);
      }

      acc = acc.concat([k]);
    });
    return acc;
  }, parameters.reduce((acc, curr) => {
    Object.keys(curr).forEach(k => {
      const index = acc.indexOf(k);

      if (index !== -1 && this.config.debug) {
        console.warn(`key[Inject]:${k} has existed, the same properties will be overridden.`);
      }

      acc = acc.concat([k]);
    });
    return acc;
  }, []));
  Object.assign.apply(Object, [this.injects].concat(parameters));
  return this;
};
/**
 * Add Juglans plugins
 *
 * ####Example:
 *
 *     app.Use(async ({ router }) => { router.get(ctx => { ctx.body='hello' }) })
 *     app.Use(async ({ httpProxy }) => { httpProxy.use(yourKoaMiddle) })
 *
 * Return middles if no params be provided
 * Note:
 * Plugin entity must be a function entity
 *
 * @param {Array} plugins
 * @api public
 */


Juglans.prototype.Use = function () {
  for (var _len3 = arguments.length, plugins = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    plugins[_key3] = arguments[_key3];
  }

  // Legitimacy asserts
  assert(plugins.findIndex(x => !is.function(x) && !(is.object(x) && is.function(x.plugin))) === -1, 'plugin entity should be a function or [object] plugin type'); // Legitimacy filtering

  plugins = plugins.map(x => is.object(x) && is.function(x.plugin) && x.plugin.bind(x) || x).filter(x => is.function(x));
  this.middles = this.middles.concat(plugins);
  return this;
};
/**
 * Run app
 *
 * #### Example:
 *
 *  app.Run(function (err, config) {
 *     if (!err) {
 *        console.log(`App:${config.name}`)
 *        console.log(`App:${config.NODE_ENV}`)
 *        console.log(`App:runing on Port:${config.port}`)
 *     } else {
 *        console.error(err)
 *     }
 *  })
 *
 * RunPlugins func has some async call in function, those plugins
 * would be executed in order in synchronization
 * Note:
 * all middles set by `Use` would be run before by setting `Config.dependency`
 *
 * @param {function} cb
 * @api public
 */


Juglans.prototype.Run =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (cb) {
    const _this = this;

    const sMiddles = scanPlugins(this.config.dependency);
    this.Use.apply(this, _toConsumableArray(sMiddles));
    yield runPlugins(this.middles, () => _this.injects, {
      execAfter(ret) {
        _this.Inject(ret);
      }

    });

    if (!is.function(cb)) {
      return _this.injects;
    }

    cb(_this.injects);
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

module.exports = inherits(Juglans, events.EventEmitter);