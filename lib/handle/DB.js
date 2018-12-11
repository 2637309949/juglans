/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-04 09:54:30
 * @modify date 2018-09-04 09:54:30
 * @desc [DB参数应用对象]
*/
const mongoose = require('../mongoose')
const is = require('is')

const assign = Object.assign
function DBContext () {
  if (!(this instanceof DBContext)) {
    return new DBContext()
  }
}

DBContext.prototype.onDepends = function (params) {
  assign(this, params)
  this.config = this.ConfigContext.getConfig()
}

DBContext.prototype.mongo = function (func) {
  if (is.function(func)) {
    const config = this.ConfigContext.getConfig()
    func({ mongoose, config })
  } else {
    throw new Error('nonsupport!')
  }
  return this
}

module.exports = DBContext
