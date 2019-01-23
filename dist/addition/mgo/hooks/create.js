"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-10 11:33:13
 * @modify date 2019-01-10 11:33:13
 * @desc [mongoose hooks functions]
 */
const mongoose = require('mongoose');

module.exports =
/*#__PURE__*/
function () {
  var _create = _asyncToGenerator(function* (name, _ref) {
    let {
      items
    } = _ref;

    try {
      const Model = mongoose.model(name);
      return Model.create(items);
    } catch (error) {
      throw error;
    }
  });

  function create(_x, _x2) {
    return _create.apply(this, arguments);
  }

  return create;
}();