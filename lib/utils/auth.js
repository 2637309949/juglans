const is = require('is')
const repo = exports

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
