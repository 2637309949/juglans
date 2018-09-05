/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-04 09:54:30
 * @modify date 2018-09-04 09:54:30
 * @desc [Model应用对象]
*/
const utils = require('../utils')
const is = require('is')

function ModelContext () {
  if (!(this instanceof ModelContext)) {
    return new ModelContext()
  }
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
ModelContext.prototype.buildStoreModel = function (params) {
  const _this = this
  if (is.object(params)) {
    _this.model = _this.storeFunc(params)
  }
}

/**
 * 获取Token存储模型
 */
ModelContext.prototype.getTokenStore = function () {
  const _this = this
  if (_this.model && _this.model['token']) {
    return _this.model['token']
  } else {
    throw new Error('get token model error')
  }
}

module.exports = ModelContext
