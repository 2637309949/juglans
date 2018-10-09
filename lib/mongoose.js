/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-01 11:25:26
 * @modify date 2018-09-01 11:25:26
 * @desc [mongoose重载]
*/
const utils = require('./utils')
const is = require('is')
const consts = require('./consts')
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
    const _PAGE = consts.pagination.MODE.PAGE
    const _ALL = consts.pagination.MODE.ALL
    const page = parseInt(ctx.query.page) || consts.pagination.PAGE
    const size = parseInt(ctx.query.size) || consts.pagination.SIZE
    const range = ctx.query.range ? ctx.query.range.toUpperCase() : _PAGE

    const cond = utils.toCond(ctx.query.cond)
    const sort = utils.toSort(ctx.query.sort)
    const project = utils.toProject(ctx.query.project)
    const populate = utils.toPopulate(ctx.query.populate)

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
    const result = await Model.create(items)
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

/**
 * 软删除函数
 * @param {String} name 模型名
 * @param {Object} ctx 上下文
 */
async function softDelMany (name, ctx) {
  try {
    const Model = mongoose.model(name)
    const cond = ctx.request.body
    const result = await Model.updateMany(cond, { $set: { _dr: true } })
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

/**
 * 软删除函数
 * @param {String} name 模型名
 * @param {Object} ctx 上下文
 */
async function softDelOne (name, ctx) {
  try {
    const Model = mongoose.model(name)
    const cond = ctx.request.body
    const result = await Model.updateOne(cond, { $set: { _dr: true } })
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

/**
 * 更新函数
 * @param {String} name 模型名
 * @param {Object} ctx 上下文
 */
async function updateMany (name, ctx) {
  try {
    const Model = mongoose.model(name)
    const { cond, doc } = ctx.request.body
    const result = await Model.updateMany(cond, { $set: doc })
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

/**
 * 更新函数
 * @param {String} name 模型名
 * @param {Object} ctx 上下文
 */
async function updateOne (name, ctx) {
  try {
    const Model = mongoose.model(name)
    const { cond, doc } = ctx.request.body
    const result = await Model.updateOne(cond, { $set: doc })
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
  },
  softDelMany: function (name) {
    return async function (ctx) {
      await softDelMany(name, ctx)
    }
  },
  softDelOne: function (name) {
    return async function (ctx) {
      await softDelOne(name, ctx)
    }
  },
  updateMany: function (name) {
    return async function (ctx) {
      await updateMany(name, ctx)
    }
  },
  updateOne: function (name) {
    return async function (ctx) {
      await updateOne(name, ctx)
    }
  }
}

/**
 * mongoose重连机制
 * @param {String} uri 链接
 * @param {Object} opts 配置参数
 * @param {Number} count 重连次数
 * @param {Function} cb 回调函数
 */
mongoose.retryConnect = function (uri, opts, count, cb) {
  let retryCount = count || 5
  const retryStrategy = function () {
    mongoose.connect(uri, opts, function (err, data) {
      cb(err, data)
      if (err) {
        retryCount -= 1
        if (retryCount >= 0) setTimeout(retryStrategy, 3000)
      }
    })
  }
  retryStrategy()
}

module.exports = mongoose
