/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-09 17:15:40
 * @modify date 2019-01-09 17:15:40
 * @desc [external plugins]
 */
module.exports = Object.assign({
  Identity: require('./identity'),
  Delivery: require('./delivery'),
  Logs: require('./logs'),
  I18n: require('./i18n'),
  Roles: require('./roles'),
  Cache: require('./cache'),
  Upload: require('./upload')
})
