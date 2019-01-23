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

const is = require('is');

const softDelMany = require('./softDelMany');

const softDelOne = require('./softDelOne');

const updateMany = require('./updateMany');

const updateOne = require('./updateOne');

const create = require('./create');

const list = require('./list');

module.exports = {
  list: function (name) {
    return (
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(function* (ctx) {
          try {
            const page = parseInt(ctx.query.page) || 1;
            const size = parseInt(ctx.query.size) || 20;
            const range = ctx.query.range === 'ALL' ? ctx.query.range.toUpperCase() : 'PAGE';
            const cond = mongoose.hooksUtils.toCond(ctx.query.cond);
            const sort = mongoose.hooksUtils.toSort(ctx.query.sort);
            const project = mongoose.hooksUtils.toProject(ctx.query.project);
            const populate = mongoose.hooksUtils.toPopulate(ctx.query.populate);
            const {
              totalpages,
              totalrecords,
              data
            } = yield list(name, {
              page,
              size,
              range,
              cond,
              sort,
              project,
              populate
            });
            ctx.body = {
              errcode: null,
              errmsg: null,
              data: {
                cond,
                page,
                size,
                sort,
                project,
                populate,
                totalpages,
                totalrecords,
                data
              }
            };
          } catch (error) {
            console.error(error);
            ctx.body = {
              errcode: 500,
              errmsg: error.message
            };
          }
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }()
    );
  },
  create: function (name) {
    return (
      /*#__PURE__*/
      function () {
        var _ref2 = _asyncToGenerator(function* (ctx) {
          try {
            const data = ctx.request.body;
            const items = is.array(data) ? data : [data];
            const result = yield create(name, {
              items
            });
            ctx.body = {
              errcode: null,
              errmsg: null,
              data: result
            };
          } catch (error) {
            console.error(error);
            ctx.body = {
              errcode: 500,
              errmsg: error.message
            };
          }
        });

        return function (_x2) {
          return _ref2.apply(this, arguments);
        };
      }()
    );
  },
  softDelMany: function (name) {
    return (
      /*#__PURE__*/
      function () {
        var _ref3 = _asyncToGenerator(function* (ctx) {
          try {
            const cond = ctx.request.body;
            const result = yield softDelMany(name, {
              cond
            });
            ctx.body = {
              errcode: null,
              errmsg: null,
              data: result
            };
          } catch (error) {
            console.error(error);
            ctx.body = {
              errcode: 500,
              errmsg: error.message
            };
          }
        });

        return function (_x3) {
          return _ref3.apply(this, arguments);
        };
      }()
    );
  },
  softDelOne: function (name) {
    return (
      /*#__PURE__*/
      function () {
        var _ref4 = _asyncToGenerator(function* (ctx) {
          try {
            const cond = ctx.request.body;
            const result = yield softDelOne(name, {
              cond
            });
            ctx.body = {
              errcode: null,
              errmsg: null,
              data: result
            };
          } catch (error) {
            console.error(error);
            ctx.body = {
              errcode: 500,
              errmsg: error.message
            };
          }
        });

        return function (_x4) {
          return _ref4.apply(this, arguments);
        };
      }()
    );
  },
  updateMany: name =>
  /*#__PURE__*/
  function () {
    var _ref5 = _asyncToGenerator(function* (ctx) {
      try {
        const {
          cond,
          doc
        } = ctx.request.body;
        const result = yield updateMany(name, {
          cond,
          doc
        });
        ctx.body = {
          errcode: null,
          errmsg: null,
          data: result
        };
      } catch (error) {
        console.error(error);
        ctx.body = {
          errcode: 500,
          errmsg: error.message
        };
      }
    });

    return function (_x5) {
      return _ref5.apply(this, arguments);
    };
  }(),
  updateOne: name =>
  /*#__PURE__*/
  function () {
    var _ref6 = _asyncToGenerator(function* (ctx) {
      try {
        const {
          cond,
          doc
        } = ctx.request.body;
        const result = yield updateOne(name, {
          cond,
          doc
        });
        ctx.body = {
          errcode: null,
          errmsg: null,
          data: result
        };
      } catch (error) {
        console.error(error);
        ctx.body = {
          errcode: 500,
          errmsg: error.message
        };
      }
    });

    return function (_x6) {
      return _ref6.apply(this, arguments);
    };
  }()
};