/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2018-10-09 14:31:35
 * @modify date 2018-10-09 14:31:35
 * @desc [注入对象]
*/
const schedule = require('node-schedule')
const moment = require('moment')
const Juglans = require('juglans')
const mongoose = Juglans.mongoose
const { taskEnv, NODE_ENV = 'local' } = process.env
const scheduleJob = schedule.scheduleJob

/**
 * 调度任务:= taskEnv===NODE_ENV
 * @param {*} param1 时间参数
 * @param {*} param2 回调函数
 */
schedule.scheduleJob = async function ({ path, name, spec, callback }) {
  const Task = mongoose.model('Task')
  await Task.remove({ name })

  schedule.tasks = schedule.tasks || []
  const tIndex = schedule.tasks.findIndex(tName => tName === name)
  if (tIndex !== -1 && taskEnv === NODE_ENV) {
    throw new Error(`${name} already existed`)
  } else if (tIndex === -1 && taskEnv === NODE_ENV) {
    await Task.create([{
      path,
      name,
      enable: true,
      _creator: 'super',
      _created: moment().unix()
    }])
    scheduleJob(spec, async function () {
      const task = await Task.findOne({ name })
      if (task && task.enable) {
        callback()
      } else {
        console.info(`Task ${name} has been forbidden!`)
      }
    })
  }
}

module.exports = {
  test: 'test',
  schedule
}
