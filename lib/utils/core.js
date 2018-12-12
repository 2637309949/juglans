const is = require('is')
const glob = require('glob')
const _ = require('lodash')

const repo = exports
/**
 * 获取指定目录下的文件
 * @param {Object} regex
 * @param {Object} options
 */
repo.scanFiles = function (regex, options) {
  return glob.sync(regex, options)
}

/**
   * 获取指定目录下的注入文件
   * @param {Object} regex
   * @param {Object} options
   */
repo.scanInjectFiles = function (regex, options) {
  const regexs = is.array(regex) ? regex : [regex]
  const files = _.flatMap(regexs, reg => repo.scanFiles(reg, options))
  const injectFiles = files
    .map(x => require(x))
    .filter(x => is.function(x))
  return injectFiles
}
