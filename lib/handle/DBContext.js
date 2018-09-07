/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-04 09:54:30
 * @modify date 2018-09-04 09:54:30
 * @desc [DB参数应用对象]
*/
const mongoose = require('../mongoose')
const Redis = require('../Redis')
const is = require('is')

function DBContext ({ConfigContext, InjectContext} = {}) {
  if (!(this instanceof DBContext)) {
    return new DBContext({ConfigContext, InjectContext})
  }
  this.ConfigContext = ConfigContext
  this.InjectContext = InjectContext
}

DBContext.prototype.setConfigContext = function (ConfigContext) {
  this.ConfigContext = ConfigContext
  return this
}

DBContext.prototype.setInjectContext = function (InjectContext) {
  this.InjectContext = InjectContext
  return this
}

/**
 * mongo 配置
 * @param {Function} func 注册函数
 * @param {Object} config 应用配置
 */
DBContext.prototype.mongo = function (func) {
  if (is.function(func)) {
    const config = this.ConfigContext.getConfig()
    func({ mongoose, config })
  }
  return mongoose
}

/**
 * redis 配置
 * @param {Function} func 注册函数
 * @param {Object} config 应用配置
 */
DBContext.prototype.redis = function (func) {
  if (is.function(func)) {
    const config = this.ConfigContext.getConfig()
    const redis = func({Redis, config})
    this.InjectContext.appendInject({ redis })
  }
  return this
}

module.exports = DBContext
