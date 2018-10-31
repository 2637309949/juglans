const path = require('path')

// 避开PKG虚拟文件系统
const __actDirName = __dirname.replace('snapshot', '')
module.exports = {
  name: 'Juglans V1.0',
  port: 3001,
  debug: true,
  mongo: {
    uri: 'mongodb://127.0.0.1:27017/test?authSource=admin',
    retryCount: 5,
    opts: {
      useNewUrlParser: true,
      poolSize: 1000,
      reconnectTries: Number.MAX_VALUE
    }
  },
  redis: {
    uri: 'redis://:F7B73743E7AEDD58E58900F4782550BF@www.wosoft.me:6412',
    retryCount: 5,
    opts: {
      maxRetriesPerRequest: 3,
      retryStrategy: function (times) {
        return null
      }
    }
  },
  depInject: {
    path: [
      path.join(__dirname, '../models/**/*.js'),
      path.join(__dirname, '../routes/**/*.js'),
      path.join(__dirname, '../tasks/**/*.js')
    ],
    ignore: [
      '**/node_modules/**'
    ]
  },
  security: {
    secret: 'ef6d85d2a46311e8aa557555c34ad35a',
    login: '/login',
    logout: '/logout',
    fakeTokens: ['DEBUG'],
    fakeUrls: [/\/apidoc\/.*$/, /\/upload\/.*$/, /\/test$/, /\/favicon\.ico$/]
  },
  bodyParser: {
    strict: false,
    jsonLimit: '5mb',
    formLimit: '1mb',
    textLimit: '1mb',
    multipart: true,
    formidable: {
      keepExtensions: true,
      uploadDir: path.join(__actDirName, '../assets/public/upload')
    }
  }
}
