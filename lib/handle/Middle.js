const koaRouter = require('koa-router')
const koaBody = require('koa-body')
const assert = require('assert')
const is = require('is')
const utils = require('../utils')

const assign = Object.assign

/**
 * 默认中间插件
 */
const defaultMiddles = [({ app, config: { prefix, bodyParser } }) => {
  const router = koaRouter({ prefix })
  router.use(koaBody(bodyParser))
  app.use(router.routes())
  app.use(router.allowedMethods())
  return {
    router
  }
}]

function MiddleContext () {
  if (!(this instanceof MiddleContext)) {
    return new MiddleContext()
  }
  this.middles = defaultMiddles
}

MiddleContext.prototype.onDepends = function (params) {
  assign(this, params)
  this.config = this.ConfigContext.getConfig()
}

MiddleContext.prototype.getMiddle = function () {
  return this.middles
}

MiddleContext.prototype.setMiddle = function (params) {
  assert.ok(is.object(params) || is.array(params) || is.function(params), 'no support')
  this.middles = utils.deepMerge([], params)
  return this
}

MiddleContext.prototype.appendMiddle = function (params) {
  assert.ok(is.object(params) || is.array(params) || is.function(params), 'no support')
  this.middles = utils.deepMerge(this.middles, params)
  return this
}
module.exports = MiddleContext
