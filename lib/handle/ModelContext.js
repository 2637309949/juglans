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

const TOEKN_KEY = 'token'
const TOEKN_METHOD = ['find', 'save', 'delete']

function ModelContext () {
  if (!(this instanceof ModelContext)) {
    return new ModelContext()
  }
}

/**
 * 依赖配置
 * @param {Object} param 依赖参数
 */
ModelContext.prototype.onDepends = function ({MiddleContext, AuthContext, ConfigContext, DBContext, ExecContext, InjectContext, ModelContext}) {
  this.AuthContext = AuthContext
  this.ConfigContext = ConfigContext
  this.DBContext = DBContext
  this.ExecContext = ExecContext
  this.InjectContext = InjectContext
  this.ModelContext = ModelContext
  this.MiddleContext = MiddleContext
}

/**
 * 设置存储函数
 * @param {Function} func
 */
ModelContext.prototype.setStoreFunc = function (func) {
  if (is.function(func)) {
    this.storeFunc = func
  }
  return this
}

/**
 * 生成存储模型
 * @param {Object} params
 */
ModelContext.prototype.buildStoreModel = function () {
  const config = this.ConfigContext.getConfig()
  if (this.storeFunc) {
    this.model = this.storeFunc({config, mongoose})
  }
  return this
}

/**
 * 获取Token存储模型
 */
ModelContext.prototype.getTokenStore = function () {
  const tokenStore = this.model && this.model[TOEKN_KEY]
  if (tokenStore) {
    const legitimate = utils.has(tokenStore, TOEKN_METHOD)
    if (!legitimate) throw new Error('CheckTokenStore Error')
    return tokenStore
  } else {
    throw new Error('get token model error')
  }
}

module.exports = ModelContext
