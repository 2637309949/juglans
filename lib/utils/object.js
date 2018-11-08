const is = require('is')
const _ = require('lodash')
const repo = exports

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
   * 获取某些属性
   */
repo.take = function (target, params, option = { suffix: '', prefix: '' }) {
  if (is.array(params)) {
    return params.reduce((acc, curr) => {
      acc[`${option.prefix}${curr}${option.suffix}`] = target[curr]
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
/**
 * 判断是否对象存在属性
 * @param {Object} target
 * @param {Object} source
 */
repo.has = function (target, source) {
  if (is.array(target) && is.array(source)) {
    return source.reduce((acc, curr) => {
      const index = target.findIndex(y => y === curr)
      if (index === -1) {
        return acc && false
      } else {
        return acc && true
      }
    }, true)
  } else if (is.object(target) && is.array(source)) {
    return source.reduce((acc, curr) => {
      const index = Object.keys(target).findIndex(y => y === curr)
      if (index === -1) {
        return acc && false
      } else {
        return acc && true
      }
    }, true)
  } else {
    throw new Error('no support!')
  }
}
