const inject = require('./utils/inject')
const auth = require('./utils/auth')
const model = require('./utils/model')
const config = require('./config')
const middle = require('./utils/middle')
const Juglans = require('../..')

new Juglans({ name: 'ness V1.0' })
  .setConfig(config)
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
