const is = require('is')
const glob = require('glob')
const _ = require('lodash')
const repo = exports

/**
 * 字符串转对象
 * @param {String} str
 * @param {String} sem
 */
repo.toSort = function (str, sem = ',') {
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
 * @param {String} str
 */
repo.toCond = function (str) {
  try {
    if (is.string(str)) {
      return JSON.parse(decodeURIComponent(str))
    }
    return {}
  } catch (error) {
    console.error('parse cond error!')
    throw error
  }
}

/**
 * 映射字段
 * @param {String} str
 * @param {String} sem
 */
repo.toProject = function (str, sem = ',') {
  if (!str || !str.trim()) return {}
  const projObj = str
    .trim()
    .split(sem)
    .filter(x => !!x)
    .map(x => x.trim())
    .reduce((acc, curr) => {
      let stat = 1
      if (curr.startsWith('-')) {
        curr = curr.substr(1)
        stat = 0
      }
      acc[curr] = stat
      return acc
    }, {})
  return projObj
}

/**
 * 映射字段
 * @param {String} str
 * @param {String} sem
 */
repo.toPopulate = function (str, sem = ',') {
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
      }
      return query
    }, query)
  } else {
    return query
  }
}

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

/**
 * 生成指定长度的字符串
 * @param {Number} number 字符长度
 */
repo.genRandomStr = function (number) {
  let text = ''
  if (is.number(number)) {
    const CARDINALSTR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    for (let i = 0; i < number; i++) {
      text += CARDINALSTR.charAt(Math.floor(Math.random() * CARDINALSTR.length))
    }
  }
  return text
}

/**
   * 生成指定长度的Token
   * @param {Number} number 字符长度
   */
repo.genToken = function (number = 32) {
  return repo.genRandomStr(number)
}

/**
 * KV映射
 * @param {Object} params
 */
repo.mapObject = function (params, func) {
  return Object.keys(params).map(key => {
    const value = params[key]
    if (is.function(func)) {
      return func(key, value)
    }
  })
}

/**
 * KV映射
 * @param {Object} params
 */
repo.mapKV = function (params, func) {
  return Object.keys(params).map(k => {
    const key = k
    const value = params[k]
    return func({key, value})
  }).reduce((acc, curr) => {
    acc[curr.key] = curr.value
    return acc
  }, {})
}

/**
   * 获取某些属性
   */
repo.take = function (target, params, option = {}) {
  const { suffix = '', prefix = '' } = option
  if (is.array(params)) {
    return params.reduce((acc, curr) => {
      acc[`${prefix}${curr}${suffix}`] = target[curr]
      return acc
    }, {})
  }
}

/**
 * 合并对象
 * @param {Object} objValue
 * @param {Object} srcValue
 */
repo.deepMerge = function (objValue, srcValue) {
  if (is.object(objValue) && is.object(srcValue)) {
    return _.mergeWith(objValue, srcValue, function (objValue, srcValue) {
      if (_.isArray(objValue) &&
          _.isArray(srcValue)) {
        return objValue.concat(srcValue)
      } else if (_.isArray(objValue) &&
          _.isObject(srcValue)) {
        return objValue.concat([srcValue])
      } else if (_.isArray(srcValue) &&
          _.isObject(objValue)) {
        return srcValue.concat([objValue])
      } else if (_.isObject(objValue) &&
          _.isObject(srcValue)) {
        return _.merge(objValue, srcValue)
      }
      return srcValue
    })
  } else if (is.array(objValue) &&
      is.array(srcValue)) {
    return objValue.concat(srcValue)
  } else if (is.array(objValue) &&
      is.object(srcValue)) {
    return objValue.concat([srcValue])
  } else {
    console.error('merge object error')
    throw new Error('unsupported types')
  }
}
