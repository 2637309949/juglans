// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of j source code is governed by a MIT style
// license that can be found in the LICENSE file.

const deepmerge = require('deepmerge')
const assert = require('assert')
const _ = require('lodash')
const is = require('is')
const options = require('./options')
const logger = require('./logger')

class Conf extends Object {
  static ConfValidOption (parameters) {
    return new options.Option(function (j) {
      parameters = parameters.map(x => _.cloneDeep(x))
      const debug = parameters.reduce((acc, curr) => (curr.debug || acc), false)
      j.config.debug = debug
      assert(parameters.findIndex(x => !is.object(x)) === -1, 'parameters should be a object')

      const configs = [j.config]
      configs.reduce((acc, curr) => {
        _.keys(curr).forEach(k => {
          const index = acc.indexOf(k)
          if (index !== -1 && j.config.debug) {
            logger.warn(`[Config]:key[${k}] has existed, the same properties will be overridden.`)
          }
          acc = acc.concat([k])
        })
        return acc
      }, parameters.reduce((acc, curr) => {
        _.keys(curr).forEach(k => {
          const index = acc.indexOf(k)
          if (index !== -1 && j.config.debug) {
            logger.warn(`[Config]:key[${k}] has existed, the same properties will be overridden.`)
          }
          acc = acc.concat([k])
        })
        return acc
      }, []))
      return parameters
    })
  }

  static ConfOption (parameters) {
    return new options.Option(function (j) {
      j.lock.acquire('config', done => {
        j.config = deepmerge.all([j.config, ...parameters])
        j.Inject({ config: j.config })
        done()
      })
      return j
    })
  }
}

module.exports.Conf = Conf
