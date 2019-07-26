// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

const _ = require('lodash')
const AsyncLock = require('async-lock')
const lock = new AsyncLock({timeout: 3000, maxPending: 100})

function Status (opts) {
  if (!(this instanceof Status)) {
    return new Status(opts)
  }
  this.status = {}
}

Status.prototype.set = function (k, v) {
  return lock.acquire('status', () => {
    _.set(this.status, k, v)
    return this
  })
}

Status.prototype.get = function (k, defaultValue) {
  return lock.acquire('status', () => {
    return _.get(this.status, k, defaultValue)
  })
}

Status.prototype.all = function () {
  return lock.acquire('status', () => {
    return this.status
  })
}

module.exports = Status
