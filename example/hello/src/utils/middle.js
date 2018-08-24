/**
 * 注入插件
 */
const logger = require('koa-logger')
const serve = require('koa-static')
const path = require('path')

module.exports = [
  logger(),
  serve(path.join(__dirname, '../assets/public'))
]
