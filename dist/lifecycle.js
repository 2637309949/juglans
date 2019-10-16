"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.
class Lifecycle extends Object {
  constructor(args) {
    super(args);
    this.hooks = [];
    this.numStarted = 0;
    this.Start = this.Start.bind(this);
    this.Stop = this.Stop.bind(this);
    this.Append = this.Append.bind(this);
  }

  Append() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    this.hooks = this.hooks.concat(args);
  }

  Start(ctx) {
    var _this = this;

    return _asyncToGenerator(function* () {
      for (const hook of _this.hooks) {
        if (hook.onStart != null) {
          try {
            yield hook.onStart(ctx);
          } catch (err1) {
            try {
              yield hook.onStop(ctx);
            } catch (err2) {
              throw new Error(`${err1},${err2}`);
            }
          }
        }
      }
    })();
  }

  Stop(ctx) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      let err;

      for (let index = 0; index < _this2.numStarted; index++) {
        const hook = _this2.hooks[index];

        if (hook.onStop === null) {
          continue;
        }

        try {
          yield hook.onStop(ctx);
        } catch (err1) {
          err = new Error(`${err},${err1}`);
        }

        if (err !== null) {
          throw err;
        }
      }
    })();
  }

}

module.exports = Lifecycle;