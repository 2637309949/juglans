// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

const is = require('is')
const assert = require('assert')

function Reverse ({ injects, juglans, inspect }) {
  assert(is.object(injects), 'injects should be a object')
  if (!(this instanceof Reverse)) {
    return new Reverse({injects, juglans})
  }
  this.injects = injects
  this.juglans = juglans
  this.inspect = inspect
}

Reverse.prototype.flushInjectFromJuglans = function () {
  this.injects = this.juglans.injects
}

// Register rfunc
Reverse.prototype.Register = async function (riFunc) {
  assert(is.function(riFunc), 'riFunc should be a function')
  this.flushInjectFromJuglans()
  const inject = await riFunc(this.injects)
  if (is.object(inject)) {
    this.juglans.Inject(inject)
  }
}

module.exports = Reverse
