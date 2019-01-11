# Juglans Framework

![Juglans flash](./asserts/flash.jpeg)

## Instruction
#### 1. Install Juglans
```shell
$ npm install Juglans
```
#### 2. Init a Juglans Instance
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

#### 2.inject your custom injects

#### 3.import your plugins

#### 4.run app

## Design Philosophy

## Plugins
### Built-in Plugins
#### 1. delivery
#### 2. i18n
#### 3. logs
#### 4. identity
#### 5. roles
#### 6. cache
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
// or
MyPlugin.prototype.plugin = function() {
    // your code
    return ({ router, config }) => {
    }
}
// 2. use your plugins
app.Use(new MyPlugin({ A: 12, B: 11 }))
// or
app.Use((new MyPlugin({ A: 12, B: 11 })).plugin)
// or
app.Use((new MyPlugin({ A: 12, B: 11 })).plugin())
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
