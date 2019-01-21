/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-02 12:51:45
 * @modify date 2018-09-02 12:51:45
 * @desc [export root object]
*/
module.exports = require('./juglans')
module.exports.Plugins = require('./plugins/index')
module.exports.utils = require('./utils')
module.exports = Object.assign(module.exports, require('./addition'))
