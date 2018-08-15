
const mongoose = require('mongoose')

async function list (name, ctx) {
  const Model = mongoose.model(name)
  try {
    const list = await Model.find({})
    ctx.body = {
      data: {
        list
      },
      error: null
    }
  } catch (error) {
    console.error(error)
    throw error
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
