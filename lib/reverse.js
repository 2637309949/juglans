// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

const is = require('is')
const assert = require('assert')

function Reverse ({ juglans, inspect }) {
  if (!(this instanceof Reverse)) {
    return new Reverse({juglans, inspect})
  }
  this.injects = juglans.injects
  this.juglans = juglans
  this.inspect = inspect
}

Reverse.prototype.flushInject = function () {
  this.injects = this.juglans.injects
}

Reverse.prototype.Register = async function (riFunc) {
  assert(is.function(riFunc), 'riFunc should be a function')
  this.flushInject()
  const ret = await riFunc(this.injects)
  if (is.object(ret) && Object.keys(ret).length > 0) {
    this.juglans.Inject(ret)
  }
}

module.exports = Reverse
