/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2018-10-09 14:31:35
 * @modify date 2018-10-09 14:31:35
 * @desc [注入对象]
*/
const schedule = require('node-schedule')

const { taskEnv, nodeEnv = 'local' } = process.env
const scheduleJob = schedule.scheduleJob

/**
 * 调度任务:= taskEnv===nodeEnv
 * @param {*} param1 时间参数
 * @param {*} param2 回调函数
 */
schedule.scheduleJob = function (param1, param2) {
  if (taskEnv === nodeEnv) {
    scheduleJob(param1, param2)
  }
}

module.exports = {
  test: 'test',
  schedule
}
