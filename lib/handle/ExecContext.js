
const utils = require('../utils')
const Http = require('../http')

function ExecContext ({ConfigContext, InjectContext, MiddleContext, ModelContext} = {}) {
  if (!(this instanceof ExecContext)) {
    return new ExecContext({ConfigContext, InjectContext, MiddleContext, ModelContext})
  }
  this.ConfigContext = ConfigContext
  this.InjectContext = InjectContext
  this.MiddleContext = MiddleContext
  this.ModelContext = ModelContext
}

/**
 * 执行函数
 * @param {Function} cb 回调函数
 */
ExecContext.prototype.execute = function (cb) {
  const config = this.ConfigContext.getConfig()
  const injectParams = this.InjectContext.getInject()

  const { port, prefix, injectPath, ignorePath } = config
  this.MiddleContext.buildRouterMiddles()
  if (injectPath) {
    const funcs = utils.scanInjectFiles(injectPath, { ignore: ignorePath })
    funcs.forEach((func) => {
      func(injectParams)
    })
  }
  this.ModelContext.buildStoreModel()
  const middles = this.MiddleContext.getMiddle()
  const app = Http({
    port,
    prefix,
    middles
  })
  app.listen(cb)
}

module.exports = ExecContext
