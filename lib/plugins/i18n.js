/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-09 16:55:19
 * @modify date 2019-01-09 16:55:19
 * @desc [i18 asserts]
 */
const assert = require('assert')
const is = require('is')

module.exports = ({ getLocales, getLocale, translate }) => async function ({ router }) {
  assert.ok(is.function(getLocales), 'getLocales can not be empty!')
  assert.ok(is.function(getLocale), 'getLocale can not be empty!')
  assert.ok(is.function(translate), 'translate can not be empty!')

  router.get('/system/i18n', async ctx => {
    try {
      const data = await getLocales()
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

  router.get('/system/i18n/:locale', async ctx => {
    try {
      const locale = ctx.params.locale
      const data = await getLocale(locale)
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

  router.post('/system/i18n/translate', async ctx => {
    try {
      const { localeFrom, localeTo, items } = ctx.request.body
      const data = await translate(localeFrom, localeTo, items)
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
