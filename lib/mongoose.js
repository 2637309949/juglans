/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-01 11:25:26
 * @modify date 2018-09-01 11:25:26
 * @desc [mongoose重载]
*/
const utils = require('./utils')
const is = require('is')
const mongoose = require('mongoose')

/**
 * 查找函数
 * @param {String} name 模型名
 * @param {Object} ctx 上下文
 */
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
    ctx.body = { errcode: 500, errmsg: error.message }
  }
}

/**
 * 创建函数
 * @param {String} name 模型名
 * @param {Object} ctx 上下文
 */
async function create (name, ctx) {
  try {
    const Model = mongoose.model(name)
    let items = ctx.request.body
    items = is.array(items) ? items : [items]
    let result = await Model.create(items)
    ctx.body = {
      errcode: null,
      errmsg: null,
      data: result
    }
  } catch (error) {
    console.error(error)
    ctx.body = { errcode: 500, errmsg: error.message }
  }
}

mongoose.hooks = {
  list: function (name) {
    return async function (ctx) {
      await list(name, ctx)
    }
  },
  create: function (name) {
    return async function (ctx) {
      await create(name, ctx)
    }
  }
}
module.exports = mongoose
