/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-10 11:33:13
 * @modify date 2019-01-10 11:33:13
 * @desc [mongoose hooks functions]
 */
const mongoose = require('mongoose')
const is = require('is')

async function list (name, { page, size, range, cond, sort, project, populate }) {
  try {
    const Model = mongoose.model(name)
    const query = Model.find(cond, project).sort(sort)
    mongoose.hooksUtils.popModel(query, populate)
    if (range === 'PAGE') {
      query.skip((page - 1) * size).limit(size)
      const data = await query.exec()
      const totalrecords = await Model.where(cond).countDocuments()
      const totalpages = Math.ceil(totalrecords / size)
      return {
        totalrecords,
        totalpages,
        data
      }
    } else if (range === 'ALL') {
      const data = await query.exec()
      const totalrecords = data.length
      return {
        totalrecords,
        data
      }
    }
  } catch (error) {
    throw error
  }
}

async function create (name, { items }) {
  try {
    const Model = mongoose.model(name)
    return Model.create(items)
  } catch (error) {
    throw error
  }
}

async function softDelMany (name, { cond }) {
  try {
    const Model = mongoose.model(name)
    return Model.updateMany(cond, { $set: { _dr: true } })
  } catch (error) {
    throw error
  }
}

async function softDelOne (name, { cond }) {
  try {
    const Model = mongoose.model(name)
    return Model.updateOne(cond, { $set: { _dr: true } })
  } catch (error) {
    throw error
  }
}

async function updateMany (name, { cond, doc }) {
  try {
    const Model = mongoose.model(name)
    return Model.updateMany(cond, { $set: doc })
  } catch (error) {
    throw error
  }
}

async function updateOne (name, { cond, doc }) {
  try {
    const Model = mongoose.model(name)
    return Model.updateOne(cond, { $set: doc })
  } catch (error) {
    throw error
  }
}

module.exports = {
  list: function (name) {
    return async function (ctx) {
      try {
        const page = parseInt(ctx.query.page) || 1
        const size = parseInt(ctx.query.size) || 20
        const range = ctx.query.range === 'ALL' ? ctx.query.range.toUpperCase() : 'PAGE'

        const cond = mongoose.hooksUtils.toCond(ctx.query.cond)
        const sort = mongoose.hooksUtils.toSort(ctx.query.sort)
        const project = mongoose.hooksUtils.toProject(ctx.query.project)
        const populate = mongoose.hooksUtils.toPopulate(ctx.query.populate)
        const {
          totalpages,
          totalrecords,
          data
        } = await list(name, { page, size, range, cond, sort, project, populate })
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
            data
          }
        }
      } catch (error) {
        console.error(error)
        ctx.body = {
          errcode: 500,
          errmsg: error.message
        }
      }
    }
  },
  create: function (name) {
    return async function (ctx) {
      try {
        const data = ctx.request.body
        const items = is.array(data) ? data : [data]
        const result = await create(name, { items })
        ctx.body = {
          errcode: null,
          errmsg: null,
          data: result
        }
      } catch (error) {
        console.error(error)
        ctx.body = {
          errcode: 500,
          errmsg: error.message
        }
      }
    }
  },
  softDelMany: function (name) {
    return async function (ctx) {
      try {
        const cond = ctx.request.body
        const result = await softDelMany(name, { cond })
        ctx.body = {
          errcode: null,
          errmsg: null,
          data: result
        }
      } catch (error) {
        console.error(error)
        ctx.body = {
          errcode: 500,
          errmsg: error.message
        }
      }
    }
  },
  softDelOne: function (name) {
    return async function (ctx) {
      try {
        const cond = ctx.request.body
        const result = await softDelOne(name, { cond })
        ctx.body = {
          errcode: null,
          errmsg: null,
          data: result
        }
      } catch (error) {
        console.error(error)
        ctx.body = {
          errcode: 500,
          errmsg: error.message
        }
      }
    }
  },
  updateMany: function (name) {
    return async function (ctx) {
      try {
        const { cond, doc } = ctx.request.body
        const result = await updateMany(name, { cond, doc })
        ctx.body = {
          errcode: null,
          errmsg: null,
          data: result
        }
      } catch (error) {
        console.error(error)
        ctx.body = {
          errcode: 500,
          errmsg: error.message
        }
      }
    }
  },
  updateOne: function (name) {
    return async function (ctx) {
      try {
        const { cond, doc } = ctx.request.body
        const result = await updateOne(name, { cond, doc })
        ctx.body = {
          errcode: null,
          errmsg: null,
          data: result
        }
      } catch (error) {
        console.error(error)
        ctx.body = {
          errcode: 500,
          errmsg: error.message
        }
      }
    }
  }
}
