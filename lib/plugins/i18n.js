/**
 * @author [Double]
 * @email [2637309949@qq.com@mail.com]
 * @create date 2019-01-09 16:55:19
 * @modify date 2019-01-09 16:55:19
 * @desc [i18 asserts]
 */
const assert = require('assert')
const is = require('is')

module.exports = ({ getI18NAssets, getI18NAssetByKey, tranI18NByLocale }) => async function ({ router, config }) {
  assert.ok(is.function(getI18NAssets), 'getI18NAssets can not be empty!')
  assert.ok(is.function(getI18NAssetByKey), 'getI18NAssetByKey can not be empty!')
  assert.ok(is.function(tranI18NByLocale), 'tranI18NByLocale can not be empty!')

  /**
     * @api {get} /system/i18n get i18n asserts
     * @apiGroup System
     * @apiDescription get i18n asserts
     * @apiSuccessExample {json}
     *   HTTP/1.1 200 OK
     *    {
     *        "errcode": null,
     *        "errmsg": null,
     *        "data": {}
     *    }
     */
  router.get('/system/i18n', async ctx => {
    try {
      const data = await getI18NAssets()
      ctx.body = {
        errcode: null,
        errmsg: null,
        data
      }
    } catch (error) {
      ctx.body = {
        errcode: 500,
        errmsg: error.message,
        data: null
      }
    }
  })

  /**
     * @api {get} /system/i18n/:key get i18n assert by key
     * @apiGroup System
     * @apiDescription get i18n assert by key
     * @apiSuccessExample {json}
     *   HTTP/1.1 200 OK
     *    {
     *        "errcode": null,
     *        "errmsg": null,
     *        "data": {}
     *    }
     */
  router.get('/system/i18n/:key', async ctx => {
    try {
      const key = ctx.params.key
      const data = await getI18NAssetByKey(key)
      ctx.body = {
        errcode: null,
        errmsg: null,
        data
      }
    } catch (error) {
      ctx.body = {
        errcode: 500,
        errmsg: error.message,
        data: null
      }
    }
  })

  /**
     * @api {get} /system/translate tran i18n
     * @apiGroup System
     * @apiDescription tran i18n
     * @apiSuccessExample {json}
     *   HTTP/1.1 200 OK
     *    {
     *        "errcode": null,
     *        "errmsg": null,
     *        "data": {}
     *    }
     */
  router.post('/system/translate', async ctx => {
    try {
      const { localeFrom, localeTo, items } = ctx.request.body
      const data = await tranI18NByLocale(localeFrom, localeTo, items)
      ctx.body = {
        errcode: null,
        errmsg: null,
        data
      }
    } catch (error) {
      ctx.body = {
        errcode: 500,
        errmsg: error.message,
        data: null
      }
    }
  })
}
