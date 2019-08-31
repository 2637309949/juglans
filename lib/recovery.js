// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.
let logger = require('./logger')

module.exports = function (out) {
  if (out !== null) {
    logger = out
  }
  return async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      logger.error(err.stack || err.message)
      ctx.status = err.status || 500
      ctx.body = {
        message: err.message || 'Internal Server Error',
        stack: err.stack || err.message
      }
      ctx.app.emit('error', err, ctx)
    }
  }
}
