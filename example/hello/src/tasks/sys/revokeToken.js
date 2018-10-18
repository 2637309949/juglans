/**
 * @author [Double]
 * @email [example@mail.com]
 * @create date 2018-10-11 21:08:05
 * @modify date 2018-10-11 21:08:05
 * @desc [只保留6个月内的Token, 分析Token]
*/
const moment = require('moment')
const Juglans = require('juglans')
const mongoose = Juglans.mongoose

const defineSchedule = {
  path: __filename,
  name: 'revokeToken',
  spec: '9 * * *',
  callback: async function () {
    const AuthToken = mongoose.model('AuthToken')
    const threshold = moment().add(-6, 'month').startOf('day').unix()
    await AuthToken.deleteMany({
      _created: {
        $lte: threshold
      }
    })
  }
}

/**
 * AuthToken 模型
 * @param {Object} mongoose
 * @param {Object} router
 */
module.exports = function ({ schedule }) {
  schedule.scheduleJob(defineSchedule)
}

/**
 * Schedule 模型
 * 方便后期寻址
 */
module.exports.defineSchedule = defineSchedule
