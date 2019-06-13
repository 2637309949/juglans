// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

const winston = require('winston')
const { combine, timestamp, printf, colorize } = winston.format

const format = combine(
  colorize(),
  timestamp(),
  printf(({ level, message, timestamp }) => {
    return `[${level}]: ${timestamp} ${message}`
  })
)

module.exports = winston.createLogger({
  level: 'info',
  format,
  transports: [
    new winston.transports.Console({ format })
  ]
})
