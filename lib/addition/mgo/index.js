const mongoose = require('mongoose')
const hooksUtils = require('./hooksUtils')
const hooks = require('./hooks')

mongoose.hooks = hooks
mongoose.hooksUtils = hooksUtils

mongoose.retryConnect = function (uri, opts, cb) {
  let retryCount = opts.retryCount || 5
  const retryStrategy = function () {
    mongoose.connect(uri, opts, function (err, data) {
      cb(err, data)
      if (err) {
        retryCount -= 1
        if (retryCount >= 0) setTimeout(retryStrategy, 3000)
      }
    })
    return mongoose
  }
  return retryStrategy()
}
module.exports = mongoose
