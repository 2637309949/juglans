/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-01 11:19:52
 * @modify date 2018-09-01 11:19:52
 * @desc [工具类]
*/
const is = require('is')
const auth = require('./auth')
const object = require('./object')
const core = require('./core')

const repo = exports
Object.assign(repo, {
  auth,
  object,
  core
})

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
 * 穿梭函数
 * @param {Object}  funcs  穿梭函数数组
 * @param {Object}  param  穿梭参数
 * @param {Object}  accFunc  前后数值
 * @param {Object}  over     穿梭前后叠加
 */
repo.traverseFunc = function ({funcs, param, accFunc, over = false}) {
  if (is.array(funcs)) {
    if (!over) {
      return Promise.all(funcs.map(func => {
        return func(param)
      }))
    } else if (is.function(accFunc) && over) {
      return funcs.reduce(async (acc, curr) => {
        const acc1 = await acc
        const acc2 = await curr(acc1)
        const acc3 = await accFunc(acc1, acc2)
        return acc3
      }, param)
    } else if (!is.function(accFunc) && over) {
      return funcs.reduce(async (acc, curr) => {
        const acc1 = await acc
        const acc2 = await curr(acc1)
        return acc2
      }, param)
    }
  } else {
    throw new Error('no support!')
  }
}

/**
 * 穿梭参数
 * @param {Object}  funcs  穿梭函数
 * @param {Object}  param  穿梭参数数组
 * @param {Object}  accFunc  前后数值
 * @param {Object}  over     穿梭前后叠加
 */
repo.traverseParams = function ({ func, params, accFunc, over }) {
  if (is.array(params)) {
    if (!over) {
      return Promise.all(params.map(param => {
        return func(param)
      }))
    } else if (is.function(accFunc) && over) {
      return params.reduce(async (acc, curr) => {
        const acc1 = await acc
        const acc2 = await func(acc1)
        const acc3 = await accFunc(acc2, curr)
        return acc3
      }, null)
    }
  } else {
    throw new Error('no support!')
  }
}
