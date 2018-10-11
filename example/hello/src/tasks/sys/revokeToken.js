const defineSchedule = {
  path: __filename,
  name: 'revokeToken',
  spec: '*/3 * * * * *',
  callback: async function () {
    console.log('The answer to life, the universe, and everything!')
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
