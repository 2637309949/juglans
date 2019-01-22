"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-05 14:31:34
 * @modify date 2019-01-05 14:31:34
 * @desc [Hooks for Reids Instance]
 */
const fmt = require('util').format;

const FORMAT = {
  TOKEN: 'TOKEN:%s'
  /**
   * json string 2 json object
   * throw a custom error if parse error
   * @param {string} str string2parse
   */

};

function json2Object(str) {
  try {
    if (!str) return null;
    return JSON.parse(str);
  } catch (error) {
    throw new Error('parse token string wrong,', error);
  }
}
/**
 * object 2 json string
 * throw a custom error if stringify error
 * @param {object} obj object2stringify
 */


function object2Json(obj) {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    throw new Error('parse token string wrong,', error);
  }
}

module.exports = {
  saveToken(redis) {
    return (
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(function* (item) {
          try {
            const itemStr = object2Json(item);
            yield redis.set(fmt(FORMAT.TOKEN, item.accessToken), itemStr);
            yield redis.set(fmt(FORMAT.TOKEN, item.refreshToken), itemStr);
          } catch (error) {
            throw error;
          }
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }()
    );
  },

  findToken(redis) {
    return (
      /*#__PURE__*/
      function () {
        var _ref2 = _asyncToGenerator(function* (accessToken, refreshToken) {
          try {
            const token = accessToken || refreshToken;
            const tokenRaw = yield redis.get(fmt(FORMAT.TOKEN, token));
            return json2Object(tokenRaw);
          } catch (error) {
            throw error;
          }
        });

        return function (_x2, _x3) {
          return _ref2.apply(this, arguments);
        };
      }()
    );
  },

  revokeToken(redis) {
    return (
      /*#__PURE__*/
      function () {
        var _ref3 = _asyncToGenerator(function* (accessToken) {
          try {
            yield redis.del(fmt(FORMAT.TOKEN, accessToken));
          } catch (error) {
            throw error;
          }
        });

        return function (_x4) {
          return _ref3.apply(this, arguments);
        };
      }()
    );
  }

};