# Juglans Framework
![Juglans flash](./asserts/flash.jpeg)
## Instruction
Set up the application of basic measures quickly, and expand the application through plug-ins
#### Install Juglans
```shell
$ npm i Juglans -S
```
#### QuickStart
```javascript
new Juglans({ name: 'Juglans V1.0' })
.Config(config)
.Inject(inject)
.Use(
  function({ router }) {
    router.get('/hello', ctx => {
      ctx.status = 200
      ctx.body = {
        message: 'juglans'
      }
    })
  }
)
.Run(function (err, config) {
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

## API Introduce
#### Set app config

By way of setting contructor params
```javascript
new Juglans({ name: 'Juglans V1.0' })
```
By way of setting config function
```javascript
app.Config(config)
```
Note:
The config pass py contructor would be overided by `app.config`


#### Inject your custom injects
All injects would be provided as plugins params next by next.   
Init injects by Inject function
```javascript
// inject init objectd
app.Inject(inject)
```
Set injects by plugin ret
```javascript
// inject init objectd
const plugin = ({ router }) => {
    return {
        myInject: 123
    }
}
```
Note1:
    Those injects from plugins ret only use after those plugin has been executed.   
Note2:
    Inject entity is a object with key and value, those has same keys entity would
be overided by those pass by lastly.

#### Import your plugins
```javascript
// import plugins
app.Use(
  function({ router }) {
    router.get('/hello', ctx => {
      ctx.status = 200
      ctx.body = {
        message: 'juglans'
      }
    })
  }
)
```
#### Run app
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
- [juglans-addition](https://github.com/2637309949/juglans-addition)
- [juglans-captcha](https://github.com/2637309949/juglans-captcha)
- [juglans-delivery](https://github.com/2637309949/juglans-delivery)
- [juglans-identify](https://github.com/2637309949/juglans-identify)
- [juglans-logger](https://github.com/2637309949/juglans-logger)
- [juglans-proxy](https://github.com/2637309949/juglans-proxy)
- [juglans-role](https://github.com/2637309949/juglans-role)
- [juglans-upload](https://github.com/2637309949/juglans-upload)
- [juglans-i18n](https://github.com/2637309949/juglans-i18n)
### Custom your plugins
Juglans is a plugins framework that can take two different kinds of parameters as plugins:
 - #### Common plugins
```javascript
// Defined your plugins
const MyPlugin = ({ A, B }) => async ({ router, config }) => {
    // your code
}
// Use your plugins
app.Use(MyPlugin({ A: 12, B: 11 }))
```
 - #### Advanced plugins
```javascript
// Defined your plugins
function MyPlugin({ A, B }) {
}
MyPlugin.prototype.plugin = ({ router, config }) => {
    // your code
}
// Use your plugins
app.Use(new MyPlugin({ A: 12, B: 11 }))
// or
app.Use((new MyPlugin({ A: 12, B: 11 })).plugin)
```
## MIT License

Copyright (c) 2018-2020 Double

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
