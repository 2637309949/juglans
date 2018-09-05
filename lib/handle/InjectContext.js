/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-04 09:54:30
 * @modify date 2018-09-04 09:54:30
 * @desc [注入参数应用对象]
*/

const mongoose = require('../mongoose')
const utils = require('../utils')
const is = require('is')

const injects = {
  mongoose,
  utils
}

function InjectContext (params) {
  if (!(this instanceof InjectContext)) {
    return new InjectContext(params)
  }
  if (is.object(params)) {
    this.injects = utils.merge(injects, params)
  } else {
    this.injects = injects
  }
}

/**
 * 获取注入参数
 */
InjectContext.prototype.getInject = function () {
  return this.injects
}

/**
 * 注入参数
 * @param {Object} params 注入对象
 */
InjectContext.prototype.setInject = function (params) {
  if (is.object(params)) {
    this.injects = utils.merge({}, params)
  }
  return this
}

/**
 * 注入参数
 * @param {Object} params 注入对象
 */
InjectContext.prototype.appendInject = function (params) {
  if (is.object(params)) {
    this.injects = utils.merge(this.injects, params)
  }
  return this
}

module.exports = InjectContext
