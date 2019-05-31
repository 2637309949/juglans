/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-05 03:10:49
 * @modify date 2019-01-05 03:10:49
 * @desc [Juglans Status Instance]
 */

const _ = require('lodash')

function Status ({ events }) {
  if (!(this instanceof Status)) {
    return new Status({ events })
  }
  this.status = {}
}

Status.prototype.set = function (k, v) {
  _.set(this.status, k, v)
  if (this.events) {
    this.events.emit('juglans:status:set', k, v)
  }
  return this
}

Status.prototype.get = function (k, defaultValue) {
  const value = _.get(this.status, k, defaultValue)
  if (this.events) {
    this.events.emit('juglans:status:get', k, value)
  }
  return value
}

Status.prototype.all = function () {
  if (this.events) {
    this.events.emit('juglans:status:all', this.status)
  }
  return this.status
}

module.exports = Status
