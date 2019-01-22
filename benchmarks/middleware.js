/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-05 14:31:34
 * @modify date 2019-01-05 14:31:34
 * @desc [Example Instance]
 */

const Juglans = require('../')

// create instance
const app = new Juglans()
app.Config({ port: 3333, name: 'juglans test v1.1' })
app.Inject({ test: 'xx' }, { test: 'xx' })

// number of middleware
let n = parseInt(process.env.MW || '1', 10)
let useAsync = process.env.USE_ASYNC === 'true'

console.log(`  ${n}${useAsync ? ' async' : ''} middleware`)

while (n--) {
  if (useAsync) {
    app.Use(async function ({ httpProxy }) {
      httpProxy.use(async (ctx, next) => {
        await next()
      })
    })
  } else {
    app.Use(function ({ httpProxy }) {
      httpProxy.use((ctx, next) => {
        next()
      })
    })
  }
}

const body = Buffer.from('Hello World')

if (useAsync) {
  app.Use(async function ({ httpProxy }) {
    httpProxy.use(async (ctx, next) => { await next(); ctx.body = body })
  })
} else {
  app.Use(function ({ httpProxy }) {
    httpProxy.use((ctx, next) => {
      next().then(() => {
        ctx.body = body
      })
    })
  })
}

// run instance
app.Run(function (err, config) {
  if (!err) {
    console.log(`App:${config.name}`)
    console.log(`App:runing on Port:${config.port}`)
  } else {
    console.error(err)
  }
})
