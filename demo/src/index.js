const logger = require('koa-logger')
const _ = require('lodash')
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
  .middle([
    logger()
  ])
  .auth(async function ({ctx, config, mongoose}) {
    const obj = _.pick(ctx.request.body, 'username', 'password')
    const User = mongoose.model('User')
    let userData = await User.findOne({
      _dr: { $ne: true },
      username: obj.username,
      password: obj.password
    })
    if (userData) {
      return {
        id: userData._id,
        username: userData.username
      }
    } else {
      return null
    }
  })
  .run(function (err) {
    if (err) {
      console.error(err)
    }
  })
