/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-05 14:31:34
 * @modify date 2019-01-05 14:31:34
 * @desc [Reids Instance]
 */
const _ = require('lodash')
const Redis = require('ioredis')
const hooks = require('./hooks')

/**
 * a function for connect redis server
 * retry retryCount if connect failture
 */
Redis.retryConnect = function (uri, opts, cb) {
  let retryCount = opts.retryCount || 5
  opts.lazyConnect = true
  const retryStrategy = function () {
    const redis = new Redis(uri, opts)
    redis.hooks = _.mapValues(hooks, x => x(redis))
    redis.connect((err, data) => {
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
