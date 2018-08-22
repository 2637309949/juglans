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
  redis: 'redis://:F7B73743E7AEDD58E58900F4782550BF@www.wosoft.me:6412',
  injectPath: [path.join(__dirname, '../models/**/*.js'), path.join(__dirname, '../routes/**/*.js')],
  ignorePath: ['**/node_modules/**']
}
