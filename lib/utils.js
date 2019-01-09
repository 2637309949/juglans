const utils = require('util')
const glob = require('glob')
const _ = require('lodash')
const is = require('is')

const repo = exports

/**
   * 获取指定目录下的注入文件
   * @param {Object} regex
   * @param {Object} options
   */
repo.scanInjects = function (options) {
  const regexs = is.array(options.path) ? options.path : [options.path]
  const files = _.flatMap(regexs, reg => glob.sync(reg, options))
  const injectFiles = files.map(x => require(x)).filter(x => is.function(x))
  return injectFiles
}

/**
 * 生成指定长度的字符串
 * @param {Number} number 字符长度
 */
repo.randomStr = function (number) {
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
 * 队列执行Promise
 * 懒计算, 支持懒参数
 * @param {Array} arrs
 */
repo.qPromise = function (arrs, args, options = { chainArgs: false, lazeArgs: false, execAfter: () => {}, execBefore: () => {} }) {
  return arrs.reduce(async (acc, curr, index) => {
    return new Promise((resolve, reject) => {
      resolve()
    }).then(() => acc).then(x => {
      if (options.execBefore) options.execBefore(x, index)
      if (options.chainArgs) {
        return curr(x)
      } else {
        return curr(options.lazeArgs ? args() : args)
      }
    }).then(x => {
      if (options.execAfter) options.execAfter(x, index)
      return x
    })
  }, Promise.resolve(!options.chainArgs && options.lazeArgs ? args() : args))
}

repo.inherits = function (src, target) {
  utils.inherits(src, target)
  return src
}
