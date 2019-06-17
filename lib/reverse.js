// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

const is = require('is')
const assert = require('assert')

function Reverse ({ injects, junlans }) {
  assert(is.object(injects), 'injects should be a object')
  if (!(this instanceof Reverse)) {
    return new Reverse({injects, junlans})
  }
  this.injects = injects
  this.junlans = junlans
}

Reverse.prototype.flushInjectFromJuglans = function () {
  this.injects = this.junlans.injects
}

Reverse.prototype.Register = function (riFunc) {
  assert(is.function(riFunc), 'riFunc should be a function')
  this.flushInjectFromJuglans()
  riFunc(this.injects)
}

module.exports = Reverse
