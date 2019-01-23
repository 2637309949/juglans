"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const utils = require('util');

const glob = require('glob');

const _ = require('lodash');

const is = require('is');

const repo = exports;
/**
   * Scan plugins from spec path
   * @param {Object} regex
   * @param {Object} options
   */

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
};
/**
   * Generate string
   * @param {number} number
   */


repo.randomStr = function () {
  let number = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 32;
  let text = '';

  if (is.number(number)) {
    const CARDINALSTR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let i = 0; i < number; i++) {
      text += CARDINALSTR.charAt(Math.floor(Math.random() * CARDINALSTR.length));
    }
  }

  return text;
};
/**
 * execute promise in orderly
 * lazy cac, support lazy params cac
 * @param {Array} arrs
 * @param {Object || Function} arrs
 */


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
      return new Promise((resolve, reject) => {
        resolve();
      }).then(() => acc).then(x => {
        if (options.execBefore) options.execBefore(x, index);

        if (options.chainArgs) {
          return curr(x);
        } else {
          return curr(is.function(args) ? args() : args);
        }
      }).then(x => {
        if (options.execAfter) options.execAfter(x, index);
        return x;
      });
    });

    return function (_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }(), Promise.resolve(!options.chainArgs && is.function(args) ? args() : args));
};
/**
 * inherits object
 */


repo.inherits = function (src, target) {
  utils.inherits(src, target);
  return src;
};