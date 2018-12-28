const assert = require('assert')
const is = require('is')

function ConfigContext (params) {
  if (!(this instanceof ConfigContext)) {
    return new ConfigContext(params)
  }
  if (is.object(params)) {
    this.config = params
  }
}

ConfigContext.prototype.onDepends = function (params) {
  Object.assign(this, params)
}

ConfigContext.prototype.getConfig = function () {
  return this.config
}

ConfigContext.prototype.config = function (params) {
  assert.ok(is.object(params), 'no support')
  this.config = Object.assign({}, params)
  return this
}

ConfigContext.prototype.appendConfig = function (params) {
  assert.ok(is.object(params), 'no support')
  this.config = Object.assign(this.config, params)
  this.InjectContext.appendInject({ config: this.config })
  return this
}

module.exports = ConfigContext
