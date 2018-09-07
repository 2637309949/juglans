/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-04 09:54:30
 * @modify date 2018-09-04 09:54:30
 * @desc [Model应用对象]
*/
const is = require('is')

const mongoose = require('../mongoose')

function ModelContext () {
  if (!(this instanceof ModelContext)) {
    return new ModelContext()
  }
}

ModelContext.prototype.setConfigContext = function (ConfigContext) {
  this.ConfigContext = ConfigContext
  return this
}

/**
 * 设置存储函数
 * @param {Function} func
 */
ModelContext.prototype.setStoreFunc = function (func) {
  const _this = this
  if (is.function(func)) {
    _this.storeFunc = func
  }
  return this
}

/**
 * 生成存储模型
 * @param {Object} params
 */
ModelContext.prototype.buildStoreModel = function () {
  const config = this.ConfigContext.getConfig()
  this.model = this.storeFunc({config, mongoose})
  return this
}

/**
 * 获取Token存储模型
 */
ModelContext.prototype.getTokenStore = function () {
  if (this.model && this.model['token']) {
    this._checkTokenStore()
    return this.model['token']
  } else {
    throw new Error('get token model error')
  }
}

/**
 * 检测Token
 */
ModelContext.prototype._checkTokenStore = function () {
  const _this = this
  if (
    _this.model &&
    _this.model['token'] &&
    _this.model['token'].find &&
    _this.model['token'].save &&
    _this.model['token'].delete
  ) {
  } else {
    throw new Error('CheckTokenStore Error')
  }
}

module.exports = ModelContext
