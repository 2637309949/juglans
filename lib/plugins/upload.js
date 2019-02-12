/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-09 16:55:19
 * @modify date 2019-01-09 16:55:19
 * @desc [upload]
 */
// ### Example:
// app.Use(
//   Upload({
//     async saveAnalysis(files) {
//       console.log(files)
//     },
//     async findAnalysis() {
//     }
//   })
// )
const assert = require('assert').strict
const ExcelJs = require('exceljs')
const utils = require('../utils')
const path = require('path')
const is = require('is')

module.exports = ({ saveAnalysis, findAnalysis, uploadPrefix = '/public/upload' }) => async ({ router }) => {
  assert.ok(is.function(saveAnalysis), 'saveAnalysis can not be empty!')
  assert.ok(is.function(findAnalysis), 'findAnalysis can not be empty!')
  /**
   * upload file
   */
  router.post('/upload', async (ctx) => {
    try {
      const files = ctx.request.files
      const fields = ctx.request.body
      const { analysis = false } = fields
      const fileNames = Object.keys(files)
      const results = []
      const data = await Promise.all(fileNames.map(async x => {
        const fileName = x
        const file = files[fileName]
        const parse = path.parse(file.path)
        const { strategys } = module.exports.strategys.find(x => x.type === file.type) || {}
        const ret = {
          type: file.type,
          uid: utils.randomStr(32).toLowerCase(),
          status: 'done',
          name: file.name,
          url: `${uploadPrefix}/${parse.base}`
        }
        if (analysis && strategys) {
          const result = await strategys(file)
          results.push(Object.assign({}, ret, result))
        }
        return ret
      }))
      await saveAnalysis(results)
      ctx.status = 200
      ctx.body = data
    } catch (error) {
      console.error(error.stack)
      ctx.body = { message: error.message }
    }
  })
  return {
    upload: {
      findAnalysis
    }
  }
}

module.exports.strategys = [{
  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  strategys: async function (file) {
    const workbook = new ExcelJs.Workbook()
    const books = await workbook.xlsx.readFile(file.path)
    const result = {
      name: file.name,
      content: []
    }
    books.worksheets.forEach(sheet => {
      const ret = {
        sheet: sheet.name,
        rows: []
      }
      sheet.eachRow(function (row, rowNumber) {
        ret.rows.push(row.values)
      })
      result.content.push(ret)
    })
    return result
  }
}]
