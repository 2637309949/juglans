const jwt = require('jsonwebtoken')
const is = require('is')
const consts = require('../consts')
const repo = exports

/**
 * 获取Token
 * @param {Object} ctx 参数
 */
repo.getTokenFromReq = function (ctx) {
  const TOKENKEY = consts.TOKENKEY
  const AUTHKEY = consts.AUTHKEY
  const query = ctx.query
  const cookies = ctx.cookies
  const body = ctx.request.body
  let accessToken = query[TOKENKEY]
  accessToken = accessToken || body[TOKENKEY]
  accessToken = accessToken || (ctx.get(AUTHKEY) ? ctx.get(AUTHKEY).split(' ').reverse()[0] : null)
  accessToken = accessToken || ctx.get(TOKENKEY)
  accessToken = accessToken || cookies.get(TOKENKEY)
  return accessToken
}

/**
 * 生成指定长度的字符串
 * @param {Number} number 字符长度
 */
repo.genRandomStr = function (number) {
  let text = ''
  if (is.number(number)) {
    const CARDINALSTR = consts.CARDINALSTR
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
