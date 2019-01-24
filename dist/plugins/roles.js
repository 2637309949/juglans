"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-11 17:38:37
 * @modify date 2019-01-11 17:38:37
 * @desc [Roles and Perm detect]
 */

/* =================== USAGE ===================
app.Use(Roles({
    async failureHandler(ctx, action){
      ctx.status = 403
      ctx.body = {
        message: 'access Denied, you don\'t have permission.'
      }
    },
    async roleHandler(ctx, action) {
      const [role, permission] = action.split('@')
      const accessData = await Identity.getAccessData(ctx)
      return true
    }
}))
=============================================== */
const Roles = require('koa-roles');

const assert = require('assert').strict;

const is = require('is');

module.exports = (_ref) => {
  let {
    failureHandler =
    /*#__PURE__*/
    function () {
      var _ref2 = _asyncToGenerator(function* (ctx, action) {
        ctx.status = 500;
        ctx.body = {
          message: 'access Denied, you don\'t have permission.'
        };
      });

      return function (_x, _x2) {
        return _ref2.apply(this, arguments);
      };
    }(),
    roleHandler
  } = _ref;
  return (_ref3) => {
    let {
      httpProxy
    } = _ref3;
    assert.ok(is.function(failureHandler), 'failureHandler can not be empty!');
    assert.ok(is.function(roleHandler), 'roleHandler can not be empty!');
    const roles = new Roles({
      failureHandler
    });
    httpProxy.use(roles.middleware());
    roles.use(roleHandler);
    return {
      roles
    };
  };
};