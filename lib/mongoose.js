const mongoose = require('mongoose')
const is = require('is')

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

    const cond = mongoose.hooksUtils.toCond(ctx.query.cond)
    const sort = mongoose.hooksUtils.toSort(ctx.query.sort)
    const project = mongoose.hooksUtils.toProject(ctx.query.project)
    const populate = mongoose.hooksUtils.toPopulate(ctx.query.populate)

    let query = Model.find(cond, project).sort(sort)
    query = mongoose.hooksUtils.popModel(query, populate)

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

/**
 * mongoose hooks
 * 对外接口钩子
 */
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
 * mongoose.hooksUtils
 * 通用工具
 */
mongoose.hooksUtils = {
  popModel (query, arrayStr) {
    if (is.array(arrayStr) && arrayStr.length > 0) {
      return arrayStr.reduce((acc, curr) => {
        if (is.string(curr)) {
          return query.populate(curr)
        }
        return query
      }, query)
    } else {
      return query
    }
  },
  toPopulate (str, sem = ',') {
    if (!str || !str.trim()) return {}
    const peObj = str
      .trim()
      .split(sem)
      .filter(x => !!x)
      .map(x => x.trim())
    return peObj
  },
  toProject (str, sem = ',') {
    if (!str || !str.trim()) return {}
    const projObj = str
      .trim()
      .split(sem)
      .filter(x => !!x)
      .map(x => x.trim())
      .reduce((acc, curr) => {
        let stat = 1
        if (curr.startsWith('-')) {
          curr = curr.substr(1)
          stat = 0
        }
        acc[curr] = stat
        return acc
      }, {})
    return projObj
  },
  toCond (str) {
    try {
      if (is.string(str)) {
        return JSON.parse(decodeURIComponent(str))
      }
      return {}
    } catch (error) {
      console.error('parse cond error!')
      throw error
    }
  },
  toSort (str, sem = ',') {
    if (!str || !str.trim()) return {}
    const sortObj = str
      .trim()
      .split(sem)
      .filter(x => !!x)
      .map(x => x.trim())
      .reduce((acc, curr) => {
        let order = 1
        if (curr.startsWith('-')) {
          curr = curr.substr(1)
          order = -1
        }
        acc[curr] = order
        return acc
      }, {})
    return sortObj
  }
}

/**
 * mongoose重连机制
 * @param {String} uri 链接
 * @param {Object} opts 配置参数
 * @param {Number} count 重连次数
 * @param {Function} cb 回调函数
 */
mongoose.retryConnect = function (uri, opts, cb) {
  let retryCount = opts.retryCount || 5
  const retryStrategy = function () {
    mongoose.connect(uri, opts, function (err, data) {
      cb(err, data)
      if (err) {
        retryCount -= 1
        if (retryCount >= 0) setTimeout(retryStrategy, 3000)
      }
    })
    return mongoose
  }
  return retryStrategy()
}

module.exports = mongoose
