const koaRouter = require('koa-router')
const koaBody = require('koa-body')
const assert = require('assert')
const is = require('is')

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
  Object.assign(this, params)
  return this
}

MiddleContext.prototype.getMiddle = function () {
  return this.middles
}

MiddleContext.prototype.setMiddle = function (parameter) {
  assert.ok(is.object(parameter) || is.array(parameter) || is.function(parameter), 'no support')
  if (is.array(parameter)) {
    this.middles = [].concat(parameter)
  } else {
    this.middles = [].concat([parameter])
  }
  return this
}

MiddleContext.prototype.appendMiddle = function (parameter) {
  assert.ok(is.object(parameter) || is.array(parameter) || is.function(parameter), 'no support')
  if (is.array(parameter)) {
    this.middles = this.middles.concat(parameter)
  } else {
    this.middles = this.middles.concat([parameter])
  }
  return this
}
module.exports = MiddleContext
