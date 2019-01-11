const utils = require('util')
const glob = require('glob')
const _ = require('lodash')
const is = require('is')
const repo = exports

/**
   * Scan plugins from spec path
   * @param {Object} regex
   * @param {Object} options
   */
repo.scanPlugins = function (options) {
  try {
    const regexs = is.array(options.path) ? options.path : [options.path]
    const filePaths = _.flatMap(regexs, reg => glob.sync(reg, options))
    const plugins = filePaths
      .map(x => require(x))
      .map(x => {
        if (is.function(x)) {
          return x
        }
        if (is.object(x) && is.function(x.plugin)) {
          const plugin = x.plugin()
          if (is.function(plugin)) {
            return plugin
          }
          return x.plugin
        }
      })
      .filter(x => is.function(x))
    return plugins
  } catch (error) {
    throw new Error(`scan injects error:${error}`)
  }
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
 * execute promise in orderly
 * lazy cac, support lazy params cac
 * @param {Array} arrs
 * @param {Object || Function} arrs
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

/**
 * Extends a object
 * @param {object} src    source Object
 * @param {object} target target Object
 */
repo.inherits = function (src, target) {
  utils.inherits(src, target)
  return src
}
