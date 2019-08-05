"use strict";

// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.
const _ = require('lodash');

const AsyncLock = require('async-lock');

function Status(opts) {
  if (!(this instanceof Status)) {
    return new Status(opts);
  }

  opts = _.merge({
    timeout: 3000,
    maxPending: 100
  }, opts);
  this.lock = new AsyncLock(opts);
  this.status = {};
}

Status.prototype.set = function (k, v) {
  return this.lock.acquire('status', () => {
    _.set(this.status, k, v);

    return this;
  });
};

Status.prototype.get = function (k, defaultValue) {
  return this.lock.acquire('status', () => {
    return _.get(this.status, k, defaultValue);
  });
};

Status.prototype.all = function () {
  return this.lock.acquire('status', () => {
    return this.status;
  });
};

module.exports = Status;