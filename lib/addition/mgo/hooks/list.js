/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-10 11:33:13
 * @modify date 2019-01-10 11:33:13
 * @desc [mongoose hooks functions]
 */

const mongoose = require('mongoose')
module.exports = async function list (name, { page, size, range, cond, sort, project, populate }) {
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
