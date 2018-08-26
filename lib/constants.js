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
