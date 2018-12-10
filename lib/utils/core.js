const is = require('is')
const glob = require('glob')
const _ = require('lodash')
const readYaml = require('read-yaml')
const path = require('path')

const repo = exports
const jConfigPath = path.join(__dirname, '../Juglans.yaml')

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
    .map(x => {
      const jsObject = require(x)
      return jsObject
    }).filter(x => {
      if (is.function(x)) {
        return true
      } else if (is.object(x) && is.function(x['inject'])) {
        return true
      }
      return false
    }).map(x => {
      if (is.function(x)) {
        return x
      } else if (is.object(x)) {
        return x['inject'].bind(x)
      }
    })
  return injectFiles
}

/**
   * 读取指定路径的YML
   * @param {String} path
   */
repo.readYAML = function (path) {
  try {
    return readYaml.sync(path)
  } catch (error) {
    console.error(error)
    throw error
  }
}

/**
   * 默认配置
   */
repo.loadJConfig = function () {
  return repo.readYAML(jConfigPath)
}
