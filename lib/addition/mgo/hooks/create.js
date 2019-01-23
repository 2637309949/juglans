/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-10 11:33:13
 * @modify date 2019-01-10 11:33:13
 * @desc [mongoose hooks functions]
 */

const mongoose = require('mongoose')
module.exports = async function create (name, { items }) {
  try {
    const Model = mongoose.model(name)
    return Model.create(items)
  } catch (error) {
    throw error
  }
}
