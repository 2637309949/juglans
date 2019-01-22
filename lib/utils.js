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
repo.scanPlugins = function (options = { path: [] }) {
  try {
    const regexs = is.array(options.path) ? options.path : [options.path]
    const filePaths = _.flatMap(regexs, reg => glob.sync(reg, options))
    const plugins = filePaths
      .map(x => require(x))
      .map(x => (is.function(x) && x) || x)
      .map(x => (is.object(x) && is.function(x.plugin) && x.plugin.bind(x)) || x)
      .filter(x => is.function(x))
    return plugins
  } catch (error) {
    throw new Error(`scan injects error:${error}`)
  }
}

/**
   * Generate string
   * @param {number} number
   */
repo.randomStr = function (number = 32) {
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
repo.runPlugins = function (arrs, args, options = { chainArgs: false, execAfter: () => {}, execBefore: () => {} }) {
  return arrs.reduce(async (acc, curr, index) => {
    return new Promise((resolve, reject) => {
      resolve()
    }).then(() => acc).then(x => {
      if (options.execBefore) options.execBefore(x, index)
      if (options.chainArgs) {
        return curr(x)
      } else {
        return curr(is.function(args) ? args() : args)
      }
    }).then(x => {
      if (options.execAfter) options.execAfter(x, index)
      return x
    })
  }, Promise.resolve(!options.chainArgs && is.function(args) ? args() : args))
}

/**
 * inherits object
 */
repo.inherits = function (src, target) {
  utils.inherits(src, target)
  return src
}
