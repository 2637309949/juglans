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
  var _list = _asyncToGenerator(function* (name, _ref) {
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

  function list(_x, _x2) {
    return _list.apply(this, arguments);
  }

  return list;
}();