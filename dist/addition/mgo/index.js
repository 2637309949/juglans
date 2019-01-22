"use strict";

/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-05 14:31:34
 * @modify date 2019-01-05 14:31:34
 * @desc [mongoose Instance]
 */
const mongoose = require('mongoose');

const hooksUtils = require('./utils');

const hooks = require('./hooks');

mongoose.hooks = hooks;
mongoose.hooksUtils = hooksUtils;

mongoose.retryConnect = function (uri, opts, cb) {
  let retryCount = opts.retryCount || 5;

  const retryStrategy = function () {
    mongoose.connect(uri, opts, (err, data) => {
      cb(err, data);

      if (err) {
        retryCount -= 1;
        if (retryCount >= 0) setTimeout(retryStrategy, 3000);
      }
    });
    return mongoose;
  };

  return retryStrategy();
};

module.exports = mongoose;