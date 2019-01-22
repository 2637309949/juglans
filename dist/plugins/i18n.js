"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-09 16:55:19
 * @modify date 2019-01-09 16:55:19
 * @desc [i18 asserts]
 */
const assert = require('assert');

const is = require('is');

module.exports = (_ref) => {
  let {
    getLocales,
    getLocale,
    translate
  } = _ref;
  return (
    /*#__PURE__*/
    function () {
      var _ref3 = _asyncToGenerator(function* (_ref2) {
        let {
          router
        } = _ref2;
        assert.ok(is.function(getLocales), 'getLocales can not be empty!');
        assert.ok(is.function(getLocale), 'getLocale can not be empty!');
        assert.ok(is.function(translate), 'translate can not be empty!');
        router.get('/system/i18n',
        /*#__PURE__*/
        function () {
          var _ref4 = _asyncToGenerator(function* (ctx) {
            try {
              const data = yield getLocales();
              ctx.body = {
                errcode: null,
                errmsg: null,
                data
              };
            } catch (error) {
              ctx.body = {
                errcode: 500,
                errmsg: error.message,
                data: null
              };
            }
          });

          return function (_x2) {
            return _ref4.apply(this, arguments);
          };
        }());
        router.get('/system/i18n/:locale',
        /*#__PURE__*/
        function () {
          var _ref5 = _asyncToGenerator(function* (ctx) {
            try {
              const locale = ctx.params.locale;
              const data = yield getLocale(locale);
              ctx.body = {
                errcode: null,
                errmsg: null,
                data
              };
            } catch (error) {
              ctx.body = {
                errcode: 500,
                errmsg: error.message,
                data: null
              };
            }
          });

          return function (_x3) {
            return _ref5.apply(this, arguments);
          };
        }());
        router.post('/system/i18n/translate',
        /*#__PURE__*/
        function () {
          var _ref6 = _asyncToGenerator(function* (ctx) {
            try {
              const {
                localeFrom,
                localeTo,
                items
              } = ctx.request.body;
              const data = yield translate(localeFrom, localeTo, items);
              ctx.body = {
                errcode: null,
                errmsg: null,
                data
              };
            } catch (error) {
              ctx.body = {
                errcode: 500,
                errmsg: error.message,
                data: null
              };
            }
          });

          return function (_x4) {
            return _ref6.apply(this, arguments);
          };
        }());
      });

      return function (_x) {
        return _ref3.apply(this, arguments);
      };
    }()
  );
};