const Redis = require('ioredis')
const _ = require('lodash')
const hooks = require('./hooks')

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
    redis.hooks = _.mapValues(hooks, x => x(redis))
    return redis
  }
  return retryStrategy()
}

module.exports = Redis
