
/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-04 09:54:30
 * @modify date 2018-09-04 09:54:30
 * @desc [ExecContext参数应用对象]
*/
const Koa = require('koa')
const is = require('is')
const utils = require('../utils')
const consts = require('../consts')

const assign = Object.assign
function ExecContext () {
  if (!(this instanceof ExecContext)) {
    return new ExecContext()
  }
}

/**
 * 依赖配置
 * @param {Object} param 依赖参数
 */
ExecContext.prototype.onDepends = function (params) {
  assign(this, params)
}

/**
 * 配置App Hook
 * @param {Function} func 函数
 */
ExecContext.prototype.setContext = function (func) {
  if (is.function(func)) {
    this.context = func
  } else {
    throw new Error('nonsupport!')
  }
  return this
}

/**
 * 配置的快捷解包
 */
ExecContext.prototype.unpackContext = function () {
  this.injectParams = this.InjectContext.getInject()
  this.config = this.ConfigContext.getConfig()
  this.middles = this.MiddleContext.getMiddle()
  return this
}

/**
 * 创建路由层
 */
ExecContext.prototype.prebuildRouter = function () {
  this.MiddleContext.prebuildRouter()
  return this
}

/**
 * 执行函数
 * @param {Function} cb 回调函数
 */
ExecContext.prototype.execute = function (cb) {
  this.prebuildRouter()
  this.unpackContext()
  const _this = this
  const config = _this.config
  const { depInject } = _this.config

  let app = new Koa()
  if (this.context) {
    this.context(app)
  }
  const router = this.MiddleContext.router
  const middles = this.middles
  const port = this.config.port

  for (const middle of middles) {
    router.use(middle)
  }
  app.use(router.routes())
  app.use(router.allowedMethods())

  // inject
  utils.traverseFunc({
    funcs: utils.core.scanInjectFiles(depInject.path, { ignore: depInject.ignore }),
    param: _this.injectParams
  })

  app.listen(port, function (err) {
    if (!err) {
      _this.emit(consts.event.INSTANCE_UP_SUCCESSFUL)
    } else {
      _this.emit(consts.event.INSTANCE_UP_FAILING)
    }
    cb(err, config)
  })
}

module.exports = ExecContext
