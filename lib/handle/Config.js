/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-04 09:54:30
 * @modify date 2018-09-04 09:54:30
 * @desc [配置参数应用对象]
*/
const is = require('is')
const utils = require('../utils')

const assign = Object.assign

function ConfigContext (params) {
  if (!(this instanceof ConfigContext)) {
    return new ConfigContext(params)
  }
  if (is.object(params)) {
    this.config = params
  }
}

ConfigContext.prototype.onDepends = function (params) {
  assign(this, params)
}

ConfigContext.prototype.getConfig = function () {
  return this.config
}

ConfigContext.prototype.config = function (params) {
  if (is.object(params)) {
    this.config = utils.object.deepMerge({}, params)
  } else {
    throw new Error('nonsupport!')
  }
  return this
}

ConfigContext.prototype.appendConfig = function (params) {
  if (is.object(params)) {
    this.config = utils.object.deepMerge(this.config, params)
    this.InjectContext.appendInject({ config: this.config })
  } else {
    throw new Error('nonsupport!')
  }
  return this
}

module.exports = ConfigContext
