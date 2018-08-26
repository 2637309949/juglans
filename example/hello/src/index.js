const middle = require('./utils/middle')
const inject = require('./utils/inject')
const model = require('./utils/model')
const auth = require('./utils/auth')
const Juglans = require('../../..')
const config = require('./config')

/**
 * 提前export app作为可引用对象
 */
const app = new Juglans({ name: 'ness V1.0' })
module.exports = app
app
  .setConfig(config)
  .redis(function ({Redis, config}) {
    return new Redis(config.redis)
  })
  .mongo(function ({mongoose, config}) {
    mongoose.connect(config.mongo.uri, config.mongo.opts, function (err) {
      if (err) {
        console.error(err)
      }
    })
  })
  .inject(inject)
  .middle(middle)
  .auth(auth)
  .store(model)
  .run(function (err) {
    if (err) {
      console.error(err)
    }
  })
