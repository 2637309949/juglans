// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

const jsonschema = require('jsonschema')
const schedule = require('node-schedule')
const Status = require('./status')
const Reverse = require('./reverse')
const {
  EventEmitter
} = require('./utils')

// default Injects,
// , status for diff plugins share
// , events for diff plugins communication
// , validator for json validator
// , reverse for reverse inject
module.exports = function (juglans) {
  const injects = {
    validator: new jsonschema.Validator(),
    events: EventEmitter(juglans),
    reverse: Reverse({ injects: juglans.injects, junlans: juglans }),
    schedule
  }
  injects.status = Status({ events: injects.events })
  return injects
}
