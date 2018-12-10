/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-06 04:59:53
 * @modify date 2018-09-06 04:59:53
 * @desc [Redis自定义]
*/

const Redis = require('ioredis')

/**
 * Redis重连机制(放弃官方自带)
 * @param {String} uri 链接
 * @param {Object} opts 配置参数
 * @param {Number} count 重连次数
 * @param {Function} cb 回调函数
 */
Redis.retryConnect = function (uri, opts, cb) {
  let retryCount = opts.retryCount || 5
  opts.lazyConnect = true
  const retryStrategy = function () {
    const redis = new Redis(uri, opts)
    redis.connect(function (err, data) {
      cb(err, data)
      if (err) {
        retryCount -= 1
        if (retryCount >= 0) setTimeout(retryStrategy, 3000)
      }
    })
    return redis
  }
  return retryStrategy()
}

module.exports = Redis
