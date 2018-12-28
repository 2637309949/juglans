const is = require('is')
const assert = require('assert')
const utils = require('../utils')

const defaultInjects = {
  utils
}

function InjectContext () {
  if (!(this instanceof InjectContext)) {
    return new InjectContext()
  }
  this.injects = defaultInjects
}

InjectContext.prototype.onDepends = function (params) {
  Object.assign(this, params)
  this.injects = Object.assign(this.injects, {
    config: this.ConfigContext.getConfig()
  })
  return this
}

InjectContext.prototype.getInject = function () {
  return this.injects
}

InjectContext.prototype.setInject = function (params) {
  assert.ok(is.object(params), 'no support')
  this.injects = Object.assign({}, params)
  return this
}

InjectContext.prototype.appendInject = function (params) {
  assert.ok(is.object(params), 'no support')
  this.injects = Object.assign(this.injects, params)
  return this
}

module.exports = InjectContext
