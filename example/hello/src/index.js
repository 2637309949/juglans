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
    const redis = new Redis(config.redis, { lazyConnect: true })
    redis.connect(function (err) {
      if (err) {
        console.log(`Redis:${config.redis} connect failed!`)
        console.error(err)
      } else {
        console.log(`Redis:${config.redis} connect successfully!`)
      }
    })
    return redis
  })
  .mongo(function ({mongoose, config}) {
    mongoose.connect(config.mongo.uri, config.mongo.opts, function (err) {
      if (err) {
        console.log(`Mongodb:${config.mongo.uri} connect failed!`)
        console.error(err)
      } else {
        console.log(`Mongodb:${config.mongo.uri} connect successfully!`)
      }
    })
  })
  .auth(auth)
  .store(model)
  .run(function (err, config) {
    if (err) {
      console.error(err)
    } else {
      console.log(`App:${config.name}`)
      console.log(`App:${config.nodeEnv}`)
      console.log(`App:runing on Port:${config.port}`)
    }
  })
