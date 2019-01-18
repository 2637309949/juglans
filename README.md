# Juglans Framework

![Juglans flash](./asserts/flash.jpeg)

## Instruction
#### 1. Install Juglans
```shell
$ npm install Juglans -S
```
#### 2. QuickStart
```javascript
const app = new Juglans({ name: 'Juglans V1.0' })
// set config
app.Config(config)
// inject init objectd
app.Inject(inject)
// import plugins
app.Use(
  // logs plugin
  Logs({
    record: async () => {}
  }),
  // static assets serve
  Delivery(),
  // example plugin
  function({ router }) {
    router.get('/hello', ctx => {
      ctx.body = 'juglans'
    })
  }
)
// run app and listen callback
app.Run(function (err, config) {
    if (err) {
        console.error(err)
    } else {
        console.log(`App:${config.name}`)
        console.log(`App:${config.NODE_ENV}`)
        console.log(`App:runing on Port:${config.port}`)
    }
})
```
3. For more details, Please reference to [juglans_template](https://github.com/2637309949/juglans_template/). 

## API
#### 1.set app config

By contructor params
```javascript
// set config
new Juglans({ name: 'Juglans V1.0' })
```
By Config function
```javascript
// set config
app.Config(config)
```
Note:
```javascript
the config pass py contructor would be overided by `app.config`
```


#### 2.inject your custom injects
   all injects would be provided as plugins params next by next. 

init injects by Inject function
```javascript
// inject init objectd
app.Inject(inject)
```
set injects by plugin ret
```javascript
// inject init objectd
const plugin = ({ router }) => {
    return {
        myInject: 123
    }
}
```
Note1:
```javascript
    those injects from plugins ret only use after those plugin has been executed.
```
Note2:
```java
    inject entity is a object with key and value, those has same keys entity would
be overided by those pass by lastly.
```

#### 3.import your plugins
```javascript
// import plugins
app.Use(
  // logs plugin
  Logs({
    record: async () => {}
  }),
  // static assets serve
  Delivery(),
  // example plugin
  function({ router }) {
    router.get('/hello', ctx => {
      ctx.body = 'juglans'
    })
  }
)
```
#### 4.run app
```javascript
// run app and listen callback
app.Run(function (err, config) {
    if (err) {
        console.error(err)
    } else {
        console.log(`App:${config.name}`)
        console.log(`App:${config.NODE_ENV}`)
        console.log(`App:runing on Port:${config.port}`)
    }
})
```
## Design Philosophy

## Plugins
### Built-in Plugins
#### 1. delivery
```javascript
// serve static files
app.Use(
  Delivery()
)
```
#### 2. i18n
```javascript

```
#### 3. logs
```javascript
// logs user req
app.Use(
  Logs({
    record: async () => {}
  })
)
```
#### 4. identity
```javascript
app.Use(Identity({
  // auth user
  auth: async function auth (ctx) {
      const form = _.pick(ctx.request.body, 'username', 'password')
      const User = mongoose.model('User')
      const one = await User.findOne({
        _dr: { $ne: true },
        username: form.username,
        password: form.password
      })
      if (one) {
        return {
          id: one._id,
          email: one.email,
          username: one.username,
          departments: one.department,
          roles: one.roles
        }
      } else {
        return null
      }
  },
  // fake token to skip check
  fakeTokens: ['DEBUG'],
  // fake urls to skip check
  fakeUrls: [
      /\/api\/v1\/upload\/.*$/,
      /\/api\/v1\/favicon\.ico$/
  ],
  // token model
  store: {
    saveToken: redis.hooks.saveToken,
    revokeToken: redis.hooks.revokeToken,
    findToken: redis.hooks.findToken,
  }
}))
```
#### 5. roles
```javascript
// init Roles
app.Use(Roles({
    async failureHandler(ctx, action){
      ctx.body = {
        errcode: 500,
        data: null,
        errmsg: 'access Denied, you don\'t have permission.'
      }
    },
    async roleHandler(ctx, action) {
      const [role, permission] = action.split('@')
      const accessData = await Identity.getAccessData(ctx)
      return true
    }
}))
// return a roles inject emtity for next plugins
```
#### 6. cache
```javascript

```
#### 7. upload
// init upload
```javascript
app.Use(
  Upload({
    async saveAnalysis(files) {
      console.log(files)
    },
    async findAnalysis() {
    }
  })
)
// return a upload inject emtity for next plugins
```



### Custom your plugins
#### 1. general plugins
```javascript
// 1. defined your plugins
const MyPlugin = ({ A, B }) => async ({ router, config }) => {
    // your code
}
// 2. use your plugins
app.Use(MyPlugin({ A: 12, B: 11 }))
```
#### 2. advanced plugins
```javascript
// 1. defined your plugins
function MyPlugin({ A, B }) {
}
MyPlugin.prototype.plugin = ({ router, config }) => {
    // your code
}
// 2. use your plugins
app.Use(new MyPlugin({ A: 12, B: 11 }))
// or
app.Use((new MyPlugin({ A: 12, B: 11 })).plugin)
```
## MIT License

Copyright (c) 2016 Freax

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
