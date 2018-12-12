const Redis = require('ioredis')
const fmt = require('util').format

const formats = {
  Token: 'Token:%s'
}

function saveToken (redis) {
  return async function (item) {
    await redis.set(fmt(formats.Token, item.accessToken), JSON.stringify(item))
  }
}

function findToken (redis) {
  return async function (accessToken) {
    let token = await redis.get(fmt(formats.Token, accessToken))
    if (token) {
      return JSON.parse(token)
    }
  }
}

function revokeToken (redis) {
  return async function (accessToken) {
    await redis.del(fmt(formats.Token, accessToken))
  }
}

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
    redis.hooks = {}
    redis.hooks.saveToken = saveToken(redis)
    redis.hooks.findToken = findToken(redis)
    redis.hooks.revokeToken = revokeToken(redis)
    return redis
  }
  return retryStrategy()
}

module.exports = Redis
