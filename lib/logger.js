/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-02 12:51:45
 * @modify date 2018-09-02 12:51:45
 * @desc [logger]
*/

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
