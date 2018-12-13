const is = require('is')
const assert = require('assert')
const mongoose = require('../mongoose')
const utils = require('../utils')

const injects = {
  mongoose,
  utils
}

function InjectContext () {
  if (!(this instanceof InjectContext)) {
    return new InjectContext()
  }
  this.injects = injects
}

InjectContext.prototype.onDepends = function (params) {
  Object.assign(this, params)
  const config = params.ConfigContext.getConfig()
  this.injects = utils.deepMerge(this.injects, { config })
}

InjectContext.prototype.getInject = function () {
  return this.injects
}

InjectContext.prototype.setInject = function (params) {
  assert.ok(is.object(params), 'no support')
  this.injects = utils.deepMerge({}, params)
  return this
}

InjectContext.prototype.appendInject = function (params) {
  assert.ok(is.object(params), 'no support')
  this.injects = utils.deepMerge(this.injects, params)
  return this
}

module.exports = InjectContext
