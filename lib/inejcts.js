// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

const jsonschema = require('jsonschema')
const schedule = require('node-schedule')
const assert = require('assert')
const _ = require('lodash')
const is = require('is')
const Reverse = require('./reverse')
const Status = require('./status')
const options = require('./options')
const EventEmitter = require('./utils').EventEmitter

class Injects extends Object {
  Acquire (name) {
    return this[name]
  }

  static InjectsValidOption (parameters) {
    return new options.Option(function (j) {
      assert(parameters.findIndex(x => !is.object(x)) === -1, 'parameters should be a object')
      const injects = [j.injects]
      injects.reduce((acc, curr) => {
        _.keys(curr).forEach(k => {
          const index = acc.indexOf(k)
          if (index !== -1 && j.config.debug) {
            throw new Error(`[Inject]:key[${k}] has existed, the same properties will be overridden.`)
          }
          acc = acc.concat([k])
        })
        return acc
      }, parameters.reduce((acc, curr) => {
        _.keys(curr).forEach(k => {
          const index = acc.indexOf(k)
          if (index !== -1 && j.config.debug) {
            throw new Error(`[Inject]:key[${k}] has existed, the same properties will be overridden.`)
          }
          acc = acc.concat([k])
        })
        return acc
      }, []))
      return parameters
    })
  }

  static InjectsOption (parameters) {
    return new options.Option(function (j) {
      j.lock.acquire('injects', done => {
        _.assign(j.injects, ...parameters)
        done()
      })
      return j
    })
  }
}

module.exports.Injects = Injects

// default Injects,
// , status for diff plugins share
// , events for diff plugins communication
// , validator for json validator
// , reverse for reverse inject
module.exports.builtInInjects = function (juglans) {
  const injects = {
    validator: new jsonschema.Validator(),
    events: EventEmitter(juglans),
    reverse: Reverse({ injects: juglans.injects, juglans }),
    schedule
  }
  injects.status = Status()
  return injects
}
