/**
 * @author [Dbouel]
 * @email [2637309949@mail.com]
 * @create date 2018-09-04 09:54:30
 * @modify date 2018-09-04 09:54:30
 * @desc [注入参数应用对象]
*/
const injects = require('../common/injects')
const utils = require('../utils')

const is = require('is')

function InjectParams (params) {
  if (!(this instanceof InjectParams)) {
    return new InjectParams(params)
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
InjectParams.prototype.getInjects = function () {
  return this.injects
}

/**
 * 注入参数
 * @param {Object} params 注入对象
 */
InjectParams.prototype.setInjects = function (params) {
  if (is.object(params)) {
    this.injects = utils.merge({}, params)
  }
  return this
}

/**
 * 注入参数
 * @param {Object} params 注入对象
 */
InjectParams.prototype.appendInjects = function (params) {
  if (is.object(params)) {
    this.injects = utils.merge(this.injects, params)
  }
  return this
}

module.exports = InjectParams
