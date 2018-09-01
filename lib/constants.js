/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-01 11:17:51
 * @modify date 2018-09-01 11:17:51
 * @desc [常量]
*/
const repo = exports

/**
 * KoaBody插件默认参数
 */
repo.KOABODYDEFULTOPTS = {
  strict: false,
  jsonLimit: '5mb',
  formLimit: '1mb',
  textLimit: '1mb',
  multipart: true
}

/**
 * token属性字段
 */
repo.TOKENKEY = 'accessToken'

/**
 * 生成随机字符基数
 */
repo.CARDINALSTR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
