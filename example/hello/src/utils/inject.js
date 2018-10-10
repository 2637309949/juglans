/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2018-10-09 14:31:35
 * @modify date 2018-10-09 14:31:35
 * @desc [注入对象]
*/
const schedule = require('node-schedule')

const { taskEnv, NODE_ENV = 'local' } = process.env
const scheduleJob = schedule.scheduleJob

/**
 * 调度任务:= taskEnv===NODE_ENV
 * @param {*} param1 时间参数
 * @param {*} param2 回调函数
 */
schedule.scheduleJob = function ({ name, spec, callback }) {
  if (taskEnv === NODE_ENV) {
    // 判断name是否数据库禁用
    scheduleJob(spec, callback)
  }
}

module.exports = {
  test: 'test',
  schedule
}
