const config = require('./config')
const Juglans = require('../..')

new Juglans({
  name: 'ness V1.0'
})
  .setConfig(config)
  .mongo(function ({mongoose, config}) {
    mongoose.connect(config.mongo.uri, config.mongo.opts, function (err) {
      if (err) {
        console.error(err)
      }
    })
  })
  .inject({test: 'test'})
  .middle()
  .run(function (err) {
    if (err) {
      console.error(err)
    }
  })
