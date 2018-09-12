const middle = require('./utils/middle')
const inject = require('./utils/inject')
const model = require('./utils/model')
const auth = require('./utils/auth')
const Juglans = require('../../..')
const config = require('./config')

const app = new Juglans({ name: 'Juglans V1.0' })
app
  .setConfig(config)
  .inject(inject)
  .middle(middle)
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
  .auth(auth)
  .store(model)
  .run(function (err, config) {
    if (err) {
      console.error(err)
    } else {
      console.log('==================================================')
      console.log(`\tApp:${config.name}`)
      console.log(`\tApp:${config.nodeEnv}`)
      console.log(`\tApp:runing on Port:${config.port}`)
      console.log('==================================================')
    }
  })
