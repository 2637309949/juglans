/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-04 09:54:30
 * @modify date 2018-09-04 09:54:30
 * @desc [中间件应用对象]
*/
const koaRouter = require('koa-router')
const koaBody = require('koa-body')
const is = require('is')
const utils = require('../utils')

const assign = Object.assign

const middles = []
function MiddleContext () {
  if (!(this instanceof MiddleContext)) {
    return new MiddleContext()
  }
  this.middles = middles
}

MiddleContext.prototype.onDepends = function (params) {
  assign(this, params)
  this.config = this.ConfigContext.getConfig()
}

MiddleContext.prototype.getMiddle = function () {
  const bodyParser = ({ router }) => {
    router.use(koaBody(this.config.bodyParser))
  }
  return [bodyParser, ...this.middles]
}

MiddleContext.prototype.getAppMiddle = function (router) {
  return [
    router.routes(),
    router.allowedMethods()
  ]
}

MiddleContext.prototype.setMiddle = function (params) {
  if (is.object(params) || is.array(params) || is.function(params)) {
    this.middles = utils.object.deepMerge([], params)
  } else {
    throw new Error('nonsupport!')
  }
  return this
}

MiddleContext.prototype.appendMiddle = function (params) {
  if (is.object(params) || is.array(params) || is.function(params)) {
    this.middles = utils.object.deepMerge(this.middles, params)
  } else {
    throw new Error('nonsupport!')
  }
  return this
}

MiddleContext.prototype.koaRouter = function () {
  const router = koaRouter({ prefix: this.config.prefix })
  this.InjectContext.appendInject({ router })
  return router
}

module.exports = MiddleContext
