"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-09 16:55:19
 * @modify date 2019-01-09 16:55:19
 * @desc [cache]
 */
module.exports = (_ref) => {
  let {
    maxAge,
    max,
    getCache,
    setCache,
    urls = []
  } = _ref;
  return (
    /*#__PURE__*/
    function () {
      var _ref3 = _asyncToGenerator(function* (_ref2) {
        let {
          router
        } = _ref2;
      });

      return function (_x) {
        return _ref3.apply(this, arguments);
      };
    }()
  );
};