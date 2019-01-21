/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-09 16:55:19
 * @modify date 2019-01-09 16:55:19
 * @desc [built-in plugins]
 */
const koaRouter = require('koa-router')
const koaBody = require('koa-body')
const Koa = require('koa')

// The first middles that create httpProxy
// default, a koa app would be create
module.exports.HttpProxy = httpProxy => () => {
  if (!httpProxy) {
    httpProxy = new Koa()
  }
  return {
    httpProxy
  }
}

// The second middles that create router
// default, a koa router would be create
module.exports.HttpRouter = router => ({ httpProxy, config: { prefix = '/api/v1', bodyParser } }) => {
  if (!router) {
    if (httpProxy instanceof Koa) {
      router = koaRouter({ prefix })
      router.use(koaBody(bodyParser))
      httpProxy.use(router.routes())
      httpProxy.use(router.allowedMethods())
    }
  }
  return {
    router
  }
}

// The last middles, run httpProxy
// those middles from code would be call in order
module.exports.ProxyRun = cb => ({ httpProxy, config }) => {
  const { port = 3001 } = config
  if (httpProxy instanceof Koa) {
    httpProxy.listen(port, err => {
      cb(err, config)
    })
  }
}
