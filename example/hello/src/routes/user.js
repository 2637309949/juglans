/**
 * @param {Object} router
 */
const userServices = require('../services/user')

module.exports = function ({ router, test }) {
  /**
     * @api {get} /test 测试接口
     * @apiGroup Test
     * @apiDescription 无Token验证机制
     * @apiSuccessExample {json}
     *   HTTP/1.1 200 OK
     *    {
     *        "errcode": null,
     *        "errmsg": null,
     *        "data": "test"
     *    }
     */
  router.get('/test', (ctx, next) => {
    ctx.body = {
      errcode: null,
      errmsg: null,
      data: 'test'
    }
  })

  /**
     * @api {get} /hello 测试接口
     * @apiGroup Test
     * @apiDescription 有Token验证机制
     * @apiSuccessExample {json}
     *   HTTP/1.1 200 OK
     *    {
     *        "errcode": null,
     *        "errmsg": null,
     *        "data": "hello:test"
     *    }
     */
  router.get('/hello', (ctx, next) => {
    ctx.body = 'hello:' + test
  })

  /**
     * @api {get} /user/aux/manager 测试接口
     * @apiGroup Test
     * @apiDescription 有Token验证机制
     * @apiParam {String} username 用户名
     * @apiSuccessExample {json}
     *   HTTP/1.1 200 OK
     *    {
     *        "errcode": null,
     *        "errmsg": null,
     *        "data": true
     *    }
     */
  router.get('/user/aux/manager', async (ctx) => {
    try {
      let username = ctx.query.username
      username = username || ctx.request.body.username
      const isManager = await userServices.isManager(username)
      ctx.body = {
        errcode: null,
        errmsg: null,
        data: isManager
      }
    } catch (error) {
      console.error(error.stack)
      ctx.body = { errcode: 500, errmsg: error.message }
    }
  })
}
