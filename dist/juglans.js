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

/* =================== USAGE ===================
const app = new Juglans({ name: 'Juglans V1.0' })
app.Config(cfg)
app.Inject(inject)
app.Use(
  Logs({
    record: async () => {}
  }),
  Delivery(),
  function({ router }) {
    router.get('/hello', ctx => {
      ctx.body = 'juglans'
    })
  }
)
app.Run(function (err, config) {
    if (!err) {
      console.log(`App:${config.name}`)
      console.log(`App:${config.NODE_ENV}`)
      console.log(`App:runing on Port:${config.port}`)
    } else {
      console.error(err)
    }
})
=============================================== */
const {
  EventEmitter
} = require('events');

const assert = require('assert');

const is = require('is');

const plugins = require('./plugins');

const {
  scanPlugins,
  runPlugins,
  inherits
} = require('./utils');
/**
 * Juglan Instance
 * @param {object} cfg app config
 * @param {object} httpProxy as `proxy http`, router as `http hander`
 */


function Juglans() {
  let cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  let {
    httpProxy,
    router
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!(this instanceof Juglans)) {
    return new Juglans(cfg, {
      httpProxy,
      router
    });
  }

  this.config = {
    port: 3001,
    name: 'Juglans V1.0',
    debug: true
  };
  this.injects = {};
  this.middles = [];
  const dMiddles = [plugins.HttpProxy(httpProxy), plugins.HttpRouter(router)];
  this.Use.apply(this, dMiddles);
  this.Config(cfg);
}
/**
 * set config
 * @param {Array} params
 * all `config` just for middles, so set your `config` base on your middles use
 * Note:
 * if you call this func muti, `params` would be override
 */


Juglans.prototype.Config = function () {
  for (var _len = arguments.length, params = new Array(_len), _key = 0; _key < _len; _key++) {
    params[_key] = arguments[_key];
  }

  assert(params.findIndex(x => !is.object(x)) === -1, 'Config entity should be a object');
  const configs = [this.config];
  configs.reduce((acc, curr) => {
    Object.keys(curr).forEach(k => {
      const index = acc.indexOf(k);

      if (index !== -1) {
        console.warn(`key[Config]:${k} has existed, and would be overrided.`);
      }

      acc = acc.concat([k]);
    });
    return acc;
  }, params.reduce((acc, curr) => {
    Object.keys(curr).forEach(k => {
      const index = acc.indexOf(k);

      if (index !== -1) {
        console.warn(`key[Config]:${k} has existed, and would be overrided.`);
      }

      acc = acc.concat([k]);
    });
    return acc;
  }, []));
  Object.assign.apply(Object, [this.config].concat(params));
  this.Inject({
    config: this.config
  });
  return this;
};
/**
 * add injects
 * @param {Array} params
 * return injects if no params be provided
 * Note:
 * Inject entity must be a object(uniqueness keys)
 */


Juglans.prototype.Inject = function () {
  for (var _len2 = arguments.length, params = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    params[_key2] = arguments[_key2];
  }

  assert(params.findIndex(x => !is.object(x)) === -1, 'Inject entity should be a object');
  const injects = [this.injects];
  injects.reduce((acc, curr) => {
    Object.keys(curr).forEach(k => {
      const index = acc.indexOf(k);

      if (index !== -1) {
        console.warn(`key[Inject]:${k} has existed, and would be overrided.`);
      }

      acc = acc.concat([k]);
    });
    return acc;
  }, params.reduce((acc, curr) => {
    Object.keys(curr).forEach(k => {
      const index = acc.indexOf(k);

      if (index !== -1) {
        console.warn(`key[Inject]:${k} has existed, and would be overrided.`);
      }

      acc = acc.concat([k]);
    });
    return acc;
  }, []));
  Object.assign.apply(Object, [this.injects].concat(params));
  return this;
};
/**
 * add plugins
 * @param {Array} plugins
 * return middles if no params be provided
 * Note:
 * Plugin entity must be a function entity
 */


Juglans.prototype.Use = function () {
  for (var _len3 = arguments.length, plugins = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    plugins[_key3] = arguments[_key3];
  }

  assert(plugins.findIndex(x => !is.function(x) && !(is.object(x) && is.function(x.plugin))) === -1, 'plugin entity should be a function or [object] plugin type');
  plugins = plugins.map(x => is.object(x) && is.function(x.plugin) && x.plugin.bind(x) || x).filter(x => is.function(x));
  this.middles = this.middles.concat(plugins);
  return this;
};
/**
 * Run app, qPromise func has some async call in function, those plugins
 * @param {function} cb
 * would be executed in order in synchronization
 * Note:
 * all middles set by `Use` would be run before by setting `Config.depInject`
 */


Juglans.prototype.Run =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (cb) {
    var _this$Use;

    const LMiddles = [plugins.ProxyRun(cb)];
    const sMiddles = scanPlugins(this.config.depInject);

    (_this$Use = this.Use.apply(this, _toConsumableArray(sMiddles))).Use.apply(_this$Use, LMiddles);

    return runPlugins(this.middles, function (ctx) {
      return function () {
        return ctx.injects;
      };
    }(this), {
      execAfter: function (ctx) {
        return ret => {
          if (is.object(ret) && Object.keys(ret).length >= 1) {
            ctx.Inject(ret);
          }
        };
      }(this)
    });
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

module.exports = inherits(Juglans, EventEmitter);