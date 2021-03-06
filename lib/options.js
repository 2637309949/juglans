// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

const {Injects} = require('./inejcts')
const {Plugins} = require('./plugins')

class Option {
  constructor (funk) {
    this.funk = funk
  }
  apply (j) {
    return this.funk(j)
  }
  check (j) {
    return this.funk(j)
  }
}

module.exports.Option = Option

module.exports.Empty = function () {
  return new Option(function (j) {
    j.injects = new Injects()
    j.plugins = new Plugins()
    j.scanPlugins = new Plugins()
    j.prePlugins = new Plugins()
    j.postPlugins = new Plugins()
    return j
  })
}
