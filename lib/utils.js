/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-01 11:19:52
 * @modify date 2018-09-01 11:19:52
 * @desc [工具类]
*/
const glob = require('glob')
const path = require('path')
const jwt = require('jsonwebtoken')
const is = require('is')
const constants = require('./consts')
const _ = require('lodash')
const readYaml = require('read-yaml')
const repo = exports
const jConfigPath = path.join(__dirname, './Juglans.yaml')

/**
 * KV映射
 * @param {Object} params
 */
repo.kvMap = function (params, func) {
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
repo.take = function (target, params) {
  if (is.array(params)) {
    return params.reduce((acc, curr) => {
      acc[curr] = target[curr]
      return acc
    }, {})
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
 * @param {String} str
 */
repo.parseCondStr = function (str) {
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
      }
      return query
    }, query)
  } else {
    return query
  }
}

/**
 * 生成指定长度的字符串
 * @param {Number} number 字符长度
 */
repo.genRandomStr = function (number) {
  let text = ''
  if (is.number(number)) {
    const CARDINALSTR = constants.CARDINALSTR
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
 * 生成JWT
 * @param {Object} param 参数
 */
repo.genJWT = function ({data, expiresIn, secret}) {
  try {
    return jwt.sign(data, secret, { expiresIn })
  } catch (error) {
    console.error('gen JWT error!')
    throw error
  }
}

/**
 * 解析JWT
 * @param {Object} param 参数
 */
repo.parseJWT = function (data, secret) {
  try {
    return jwt.verify(data, secret)
  } catch (error) {
    console.error('parse JWT error!')
    throw error
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
    return Object.keys(target).reduce((acc, curr) => {
      const index = target.findIndex(y => y === curr)
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

/**
 * 获取Token
 * @param {Object} ctx 参数
 */
repo.getTokenFromReq = function (ctx) {
  const TOKENKEY = constants.TOKENKEY
  const query = ctx.query
  const cookies = ctx.cookies
  const body = ctx.request.body
  const accessToken =
    query[TOKENKEY] ||
    body[TOKENKEY] ||
    (ctx.get('Authorization') ? ctx.get('Authorization').split(' ').reverse()[0] : null) ||
    (ctx.get(TOKENKEY) ? ctx.get(TOKENKEY) : null) ||
    cookies.get(TOKENKEY)
  return accessToken
}
