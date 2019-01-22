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

function list(_x, _x2) {
  return _list.apply(this, arguments);
}

function _list() {
  _list = _asyncToGenerator(function* (name, _ref) {
    let {
      page,
      size,
      range,
      cond,
      sort,
      project,
      populate
    } = _ref;

    try {
      const Model = mongoose.model(name);
      const query = Model.find(cond, project).sort(sort);
      mongoose.hooksUtils.popModel(query, populate);

      if (range === 'PAGE') {
        query.skip((page - 1) * size).limit(size);
        const data = yield query.exec();
        const totalrecords = yield Model.where(cond).countDocuments();
        const totalpages = Math.ceil(totalrecords / size);
        return {
          totalrecords,
          totalpages,
          data
        };
      } else if (range === 'ALL') {
        const data = yield query.exec();
        const totalrecords = data.length;
        return {
          totalrecords,
          data
        };
      }
    } catch (error) {
      throw error;
    }
  });
  return _list.apply(this, arguments);
}

function create(_x3, _x4) {
  return _create.apply(this, arguments);
}

function _create() {
  _create = _asyncToGenerator(function* (name, _ref2) {
    let {
      items
    } = _ref2;

    try {
      const Model = mongoose.model(name);
      return Model.create(items);
    } catch (error) {
      throw error;
    }
  });
  return _create.apply(this, arguments);
}

function softDelMany(_x5, _x6) {
  return _softDelMany.apply(this, arguments);
}

function _softDelMany() {
  _softDelMany = _asyncToGenerator(function* (name, _ref3) {
    let {
      cond
    } = _ref3;

    try {
      const Model = mongoose.model(name);
      return Model.updateMany(cond, {
        $set: {
          _dr: true
        }
      });
    } catch (error) {
      throw error;
    }
  });
  return _softDelMany.apply(this, arguments);
}

function softDelOne(_x7, _x8) {
  return _softDelOne.apply(this, arguments);
}

function _softDelOne() {
  _softDelOne = _asyncToGenerator(function* (name, _ref4) {
    let {
      cond
    } = _ref4;

    try {
      const Model = mongoose.model(name);
      return Model.updateOne(cond, {
        $set: {
          _dr: true
        }
      });
    } catch (error) {
      throw error;
    }
  });
  return _softDelOne.apply(this, arguments);
}

function updateMany(_x9, _x10) {
  return _updateMany.apply(this, arguments);
}

function _updateMany() {
  _updateMany = _asyncToGenerator(function* (name, _ref5) {
    let {
      cond,
      doc
    } = _ref5;

    try {
      const Model = mongoose.model(name);
      return Model.updateMany(cond, {
        $set: doc
      });
    } catch (error) {
      throw error;
    }
  });
  return _updateMany.apply(this, arguments);
}

function updateOne(_x11, _x12) {
  return _updateOne.apply(this, arguments);
}

function _updateOne() {
  _updateOne = _asyncToGenerator(function* (name, _ref6) {
    let {
      cond,
      doc
    } = _ref6;

    try {
      const Model = mongoose.model(name);
      return Model.updateOne(cond, {
        $set: doc
      });
    } catch (error) {
      throw error;
    }
  });
  return _updateOne.apply(this, arguments);
}

module.exports = {
  list: function (name) {
    return (
      /*#__PURE__*/
      function () {
        var _ref7 = _asyncToGenerator(function* (ctx) {
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

        return function (_x13) {
          return _ref7.apply(this, arguments);
        };
      }()
    );
  },
  create: function (name) {
    return (
      /*#__PURE__*/
      function () {
        var _ref8 = _asyncToGenerator(function* (ctx) {
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

        return function (_x14) {
          return _ref8.apply(this, arguments);
        };
      }()
    );
  },
  softDelMany: function (name) {
    return (
      /*#__PURE__*/
      function () {
        var _ref9 = _asyncToGenerator(function* (ctx) {
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

        return function (_x15) {
          return _ref9.apply(this, arguments);
        };
      }()
    );
  },
  softDelOne: function (name) {
    return (
      /*#__PURE__*/
      function () {
        var _ref10 = _asyncToGenerator(function* (ctx) {
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

        return function (_x16) {
          return _ref10.apply(this, arguments);
        };
      }()
    );
  },
  updateMany: function (name) {
    return (
      /*#__PURE__*/
      function () {
        var _ref11 = _asyncToGenerator(function* (ctx) {
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

        return function (_x17) {
          return _ref11.apply(this, arguments);
        };
      }()
    );
  },
  updateOne: function (name) {
    return (
      /*#__PURE__*/
      function () {
        var _ref12 = _asyncToGenerator(function* (ctx) {
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

        return function (_x18) {
          return _ref12.apply(this, arguments);
        };
      }()
    );
  }
};