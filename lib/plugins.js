/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-09 16:55:19
 * @modify date 2019-01-09 16:55:19
 * @desc [built-in plugins]
 */
const koaRouter = require('koa-router')
const koaBody = require('koa-body')
const assert = require('assert')
const Koa = require('koa')
const utils = require('./utils')

const repo = module.exports

// The first middles that create httpProxy
// default, a koa app would be create
repo.HttpProxy = httpProxy => ({ config: { engine } }) => {
  if (!httpProxy) {
    engine = utils.someOrElse(engine, 'koa')
    if (engine === 'koa') {
      httpProxy = new Koa()
    } else {
      assert(false, 'Other engines are not yet supported, Please welcome the attention.')
    }
  }
  return {
    httpProxy
  }
}

// The second middles that create router
// default, a koa router would be create
repo.HttpRouter = router => ({ httpProxy, config: { prefix, bodyParser, engine } }) => {
  if (!router) {
    engine = utils.someOrElse(engine, 'koa')
    if (engine === 'koa') {
      router = koaRouter({ prefix: utils.someOrElse(prefix, '/api/v1') })
      router.use(koaBody(bodyParser))
      httpProxy.use(router.routes())
      httpProxy.use(router.allowedMethods())
    } else {
      assert(false, 'Other engines are not yet supported, Please welcome the attention.')
    }
  }
  return {
    router
  }
}

// The last middles, run httpProxy
// those middles from code would be call in order
repo.ProxyRun = cb => ({ httpProxy, config }) => {
  if (httpProxy instanceof Koa) {
    httpProxy.listen(utils.someOrElse(config.port, 3000), err => cb(err, config))
  }
}
