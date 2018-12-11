/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-04 09:54:30
 * @modify date 2018-09-04 09:54:30
 * @desc [注入参数应用对象]
*/
const is = require('is')
const mongoose = require('../mongoose')
const utils = require('../utils')

const assign = Object.assign
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
  assign(this, params)
  const config = params.ConfigContext.getConfig()
  this.injects = utils.object.deepMerge(this.injects, { config })
}

InjectContext.prototype.getInject = function () {
  return this.injects
}

InjectContext.prototype.setInject = function (params) {
  if (is.object(params)) {
    this.injects = utils.object.deepMerge({}, params)
  } else {
    throw new Error('nonsupport!')
  }
  return this
}

InjectContext.prototype.appendInject = function (params) {
  if (is.object(params)) {
    this.injects = utils.object.deepMerge(this.injects, params)
  } else {
    throw new Error('nonsupport!')
  }
  return this
}

module.exports = InjectContext
