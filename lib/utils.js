/**
 * 工具类
 */
const glob = require('glob')
const is = require('is')
const _ = require('lodash')
const readYaml = require('read-yaml')

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
    .map(x => {
      const jsObject = require(x)
      return jsObject
    }).filter(x => {
      return is.function(x)
    })
  return injectFiles
}

/**
 * 读取指定路径的YML
 * @param {String} path
 */
repo.readYAML = function (path) {
  try {
    const ret = readYaml.sync(path)
    return ret
  } catch (error) {
    console.error(error)
    throw error
  }
}

/**
 * 合并对象
 * @param {object} objValue
 * @param {object} srcValue
 */
repo.mergeConfig = function (objValue, srcValue) {
  return _.mergeWith(objValue, srcValue, function (objValue, srcValue) {
    if (_.isArray(objValue)) {
      return objValue.concat(srcValue)
    }
    return srcValue
  })
}

/**
 * 空函数
 */
repo.nullFunc = function () {
}

/**
 * 字符串转对象
 * @param {String} str
 * @param {String} sem
 */
repo.parseSortStr = function (str, sem = ',') {
  if (!str || !str.trim()) return {}
  const sortObj = str
    .trim()
    .split(sem)
    .filter(x => !!x)
    .map(x => x.trim())
    .reduce((acc, curr) => {
      let order = 1
      if (curr.startsWith('-')) {
        curr = curr.substr(1)
        order = -1
      }
      acc[curr] = order
      return acc
    }, {})
  return sortObj
}

/**
 * 解析cond
 */
repo.parseCondStr = function (str) {
  try {
    if (str) {
      const cond = JSON.parse(decodeURIComponent(str))
      return cond
    } else {
      return {}
    }
  } catch (error) {
    console.error('解析cond出错')
    throw error
  }
}

/**
 * 映射字段
 * @param {String} str
 * @param {String} sem
 */
repo.parsePtStr = function (str, sem = ',') {
  if (!str || !str.trim()) return {}
  const projObj = str
    .trim()
    .split(sem)
    .filter(x => !!x)
    .map(x => x.trim())
    .reduce((acc, curr) => {
      let order = 1
      if (curr.startsWith('-')) {
        curr = curr.substr(1)
        order = 0
      }
      acc[curr] = order
      return acc
    }, {})
  return projObj
}

/**
 * 映射字段
 * @param {String} str
 * @param {String} sem
 */
repo.parsePeStr = function (str, sem = ',') {
  if (!str || !str.trim()) return {}
  const peObj = str
    .trim()
    .split(sem)
    .filter(x => !!x)
    .map(x => x.trim())
  return peObj
}

/**
 * 填充引用
 * @param {Object} model
 * @param {Array} arrayStr
 */
repo.popModel = function (query, arrayStr) {
  if (is.array(arrayStr) && arrayStr.length > 0) {
    return arrayStr.reduce((acc, curr) => {
      if (is.string(curr)) {
        return query.populate(curr)
      } else {
        return query
      }
    }, query)
  } else {
    return query
  }
}
