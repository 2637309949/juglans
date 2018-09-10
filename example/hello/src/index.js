const middle = require('./utils/middle')
const inject = require('./utils/inject')
const model = require('./utils/model')
const auth = require('./utils/auth')
const Juglans = require('../../..')
const config = require('./config')

const app = new Juglans({ name: 'Juglans V1.0' })
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
  .run(function (err, config) {
    if (err) {
      console.error(err)
    } else {
      console.log('==================================================')
      console.log(`\tApp nodeEnv:${config.nodeEnv}`)
      console.log(`\tApp:${config.name} run on Port:${config.port}`)
      console.log('==================================================')
    }
  })
