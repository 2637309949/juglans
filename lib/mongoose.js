/**
 * mongoose 自定义
 */
const utils = require('./utils')
const mongoose = require('mongoose')

async function list (name, ctx) {
  try {
    const Model = mongoose.model(name)
    let list
    const _PAGE = 'PAGE'
    const _ALL = 'ALL'
    const page = parseInt(ctx.query.page) || 1
    const size = parseInt(ctx.query.size) || 20
    const range = ctx.query.range ? ctx.query.range.toUpperCase() : _PAGE

    const cond = utils.parseCondStr(ctx.query.cond)
    const sort = utils.parseSortStr(ctx.query.sort)
    const project = utils.parsePtStr(ctx.query.project)
    const populate = utils.parsePeStr(ctx.query.populate)

    let query = Model.find(cond, project).sort(sort)
    query = utils.popModel(query, populate)

    if (_PAGE === range) {
      query.skip((page - 1) * size).limit(size)
      list = await query.exec()
      const totalrecords = await Model.where(cond).countDocuments()
      const totalpages = Math.ceil(totalrecords / size)
      ctx.body = {
        errcode: null,
        errmsg: null,
        data: {
          cond,
          page,
          size,
          sort,
          project,
          populate,
          totalpages,
          totalrecords,
          list
        }
      }
    } else if (_ALL === range) {
      const list = await query.exec()
      const totalrecords = list.length
      ctx.body = {
        errcode: null,
        errmsg: null,
        data: {
          cond,
          sort,
          project,
          populate,
          totalrecords,
          list
        }
      }
    }
  } catch (error) {
    console.error(error)
    ctx.body = { errcode: 500, errmsg: error.message, data: null }
  }
}

mongoose.hooks = {
  list: function (name) {
    return async function (ctx) {
      await list(name, ctx)
    }
  }
}
module.exports = mongoose
