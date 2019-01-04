const fmt = require('util').format

const formats = {
  TOKEN: 'TOKEN:%s'
}

function saveToken (redis) {
  return async function (item) {
    await redis.set(fmt(formats.Token, item.accessToken), JSON.stringify(item))
    await redis.set(fmt(formats.Token, item.refreshToken), JSON.stringify(item))
  }
}

function findToken (redis) {
  return async function (accessToken, refreshToken) {
    accessToken = accessToken || refreshToken
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

module.exports = {
  saveToken,
  findToken,
  revokeToken
}
