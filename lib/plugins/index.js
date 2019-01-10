/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-09 17:15:40
 * @modify date 2019-01-09 17:15:40
 * @desc [mudule export]
 */
const koaRouter = require('koa-router')
const koaBody = require('koa-body')
const Koa = require('koa')

module.exports = Object.assign({
  Identity: require('./identity'),
  Delivery: require('./delivery'),
  Logs: require('./logs'),
  I18n: require('./i18n')
})

// the first middles that create httpProxy
// default, a koa app would be create
module.exports.HttpProxy = httpProxy => () => {
  if (!httpProxy) {
    httpProxy = new Koa()
  }
  return {
    httpProxy
  }
}

// the second middles that create router
// default, a koa router would be create
module.exports.HttpRouter = router => ({ httpProxy, config: { prefix, bodyParser } }) => {
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

// the last middles, run httpProxy
// those middles from code would be call in order
module.exports.LastMiddles = cb => ({ httpProxy, config }) => {
  if (httpProxy instanceof Koa) {
    httpProxy.listen(config.port, err => {
      cb(err, config)
    })
  }
}
