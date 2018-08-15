const path = require('path')

module.exports = {
  port: 3000,
  mongo: {
    uri: 'mongodb://localhost:27017/test?authSource=admin',
    opts: {
      useNewUrlParser: true,
      poolSize: 1000,
      reconnectTries: Number.MAX_VALUE
    }
  },
  injectPath: [path.join(__dirname, '../../**/*.js')],
  ignorePath: ['**/node_modules/**']
}
