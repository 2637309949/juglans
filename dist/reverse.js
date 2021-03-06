"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.
const is = require('is');

const assert = require('assert');

function Reverse(_ref) {
  let {
    juglans,
    inspect
  } = _ref;

  if (!(this instanceof Reverse)) {
    return new Reverse({
      juglans,
      inspect
    });
  }

  this.injects = juglans.injects;
  this.juglans = juglans;
  this.inspect = inspect;
}

Reverse.prototype.flushInject = function () {
  this.injects = this.juglans.injects;
};

Reverse.prototype.Register =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* (riFunc) {
    assert(is.function(riFunc), 'riFunc should be a function');
    this.flushInject();
    const ret = yield riFunc(this.injects);

    if (is.object(ret) && Object.keys(ret).length > 0) {
      this.juglans.Inject(ret);
    }
  });

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();

module.exports = Reverse;