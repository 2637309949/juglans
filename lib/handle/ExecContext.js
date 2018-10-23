
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
 * 注入函数
 */
ExecContext.prototype.inject = function () {
  const injectParams = this.injectParams
  const injectPath = this.config.injectPath
  const ignore = this.config.ignorePath
  if (injectPath) {
    const funcs = utils.scanInjectFiles(injectPath, { ignore })
    utils.traverseFunc({ funcs, param: injectParams })
  } else {
    console.log('no injectPath has been found!')
  }
}

/**
 * 创建路由层
 */
ExecContext.prototype.prebuildRouter = function () {
  this.MiddleContext.prebuildRouter()
  return this
}

/**
 * 创建模型存储
 */
ExecContext.prototype.buildStoreModel = function () {
  this.ModelContext.buildStoreModel()
  return this
}

/**
 * 运行Http
 * @param {Function} cb 回调函数
 */
ExecContext.prototype.runHttp = function (cb) {
  const _this = this
  const config = _this.config
  const port = config.port
  const middles = _this.middles
  let app = new Koa()
  if (_this.context) {
    _this.context(app)
  }
  utils.traverseParams({
    func: app.use.bind(app),
    params: middles
  })
  app.listen(port, function (err) {
    if (!err) {
      _this.emit(consts.event.INSTANCE_UP_SUCCESSFUL)
    } else {
      _this.emit(consts.event.INSTANCE_UP_FAILING)
    }
    cb(err, config)
  })
  return this
}

/**
 * 执行函数
 * @param {Function} cb 回调函数
 */
ExecContext.prototype.execute = function (cb) {
  this.prebuildRouter()
  this.unpackContext()
  this.inject()
  this.buildStoreModel()
  this.runHttp(cb)
}

module.exports = ExecContext
