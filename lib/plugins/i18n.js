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
      ctx.status = 200
      ctx.body = data
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        message: error.message
      }
    }
  })

  router.get('/system/i18n/:key', async ctx => {
    try {
      const key = ctx.params.key
      const data = await getLocale(key)
      ctx.status = 200
      ctx.body = data
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        message: error.message
      }
    }
  })

  router.post('/system/i18n/translate', async ctx => {
    try {
      const { from, to, items } = ctx.request.body
      const data = await translate({ from, to, items })
      ctx.body = data
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        message: error.message
      }
    }
  })
  return {
    i18n: {
      getLocales,
      getLocale,
      translate
    }
  }
}
