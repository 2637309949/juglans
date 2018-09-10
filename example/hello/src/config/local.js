const path = require('path')

module.exports = {
  port: 3001,
  mongo: {
    uri: 'mongodb://localhost:27017/test?authSource=admin',
    opts: {
      useNewUrlParser: true,
      poolSize: 1000,
      reconnectTries: Number.MAX_VALUE
    }
  },
  debug: true,
  redis: 'redis://:F7B73743E7AEDD58E58900F4782550BF@www.wosoft.me:6412',
  ignorePath: [
    '**/node_modules/**'
  ],
  injectPath: [
    path.join(__dirname, '../models/**/*.js'),
    path.join(__dirname, '../routes/**/*.js')
  ],
  authConfig: {
    secret: 'ef6d85d2a46311e8aa557555c34ad35a',
    login: '/login',
    logout: '/logout',
    fakeTokens: ['DEBUG'],
    fakeUrls: [/\/test$/]
  },
  koaBodyOpts: {
    strict: false,
    jsonLimit: '5mb',
    formLimit: '1mb',
    textLimit: '1mb',
    multipart: true,
    formidable: {
      keepExtensions: true,
      uploadDir: path.join(__dirname, '../assets/public/upload')
    }
  }
}
