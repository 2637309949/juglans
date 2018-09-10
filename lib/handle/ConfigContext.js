/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-04 09:54:30
 * @modify date 2018-09-04 09:54:30
 * @desc [配置参数应用对象]
*/
const utils = require('../utils')
const is = require('is')
const config = utils.loadJConfig()

function ConfigContext (params) {
  if (!(this instanceof ConfigContext)) {
    return new ConfigContext(params)
  }
  if (is.object(params)) {
    this.config = utils.deepMerge(config, params)
  } else {
    this.config = config
  }
}

ConfigContext.prototype.setInjectContext = function (InjectContext) {
  this.InjectContext = InjectContext
}
/**
 * 获取参数
 */
ConfigContext.prototype.getConfig = function () {
  return this.config
}

/**
 * 注入参数
 * @param {Object} params 注入对象
 */
ConfigContext.prototype.setConfig = function (params) {
  if (is.object(params)) {
    this.config = utils.deepMerge({}, params)
  }
  return this
}

/**
 * 注入参数
 * @param {Object} params 注入对象
 */
ConfigContext.prototype.appendConfig = function (params) {
  if (is.object(params)) {
    this.config = utils.deepMerge(this.config, params)
    this.InjectContext.appendInject({ config: this.config })
  }
  return this
}

module.exports = ConfigContext