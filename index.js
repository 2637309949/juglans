/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-02 12:51:45
 * @modify date 2018-09-02 12:51:45
 * @desc [导出根对象]
*/
module.exports = require('./lib/Juglans')

// 其他对象导出
module.exports.mongoose = require('./lib/mongoose')
module.exports.Redis = require('./lib/Redis')
module.exports.utils = require('./lib/utils')
module.exports.consts = require('./lib/consts')
