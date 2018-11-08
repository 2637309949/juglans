/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-04 09:54:30
 * @modify date 2018-09-04 09:54:30
 * @desc [Model应用对象]
*/
const is = require('is')
const mongoose = require('../mongoose')
const utils = require('../utils')

const TOEKN_KEY = 'TOKEN'
const TOEKN_METHOD = ['find', 'save', 'delete']

const assign = Object.assign
function ModelContext () {
  if (!(this instanceof ModelContext)) {
    return new ModelContext()
  }
}

/**
 * 依赖配置
 * @param {Object} param 依赖参数
 */
ModelContext.prototype.onDepends = function (params) {
  assign(this, params)
}

/**
 * 设置存储函数
 * @param {Function} params
 */
ModelContext.prototype.setStoreFunc = function (params) {
  if (is.function(params)) {
    this.storeFunc = params
  } else {
    this.storeFunc = () => {
      return params
    }
  }
  return this
}

/**
 * 生成存储模型
 * @param {Object} params
 */
ModelContext.prototype.buildStoreModel = function () {
  const config = this.ConfigContext.getConfig()
  if (is.function(this.storeFunc)) {
    this.model = this.storeFunc({config, mongoose})
  } else {
    throw new Error('nonsupport!')
  }
  return this
}

/**
 * 获取Token存储模型
 */
ModelContext.prototype.getTokenStore = function () {
  const store = this.model && this.model[TOEKN_KEY]
  if (store) {
    const legal = utils.object.has(store, TOEKN_METHOD)
    if (!legal) throw new Error('CheckTokenStore Error')
    return store
  } else {
    throw new Error('get token model error')
  }
}

module.exports = ModelContext
