# Juglans Framework

![Juglans flash](./asserts/flash.jpeg)

## Instruction
1. Install Juglans
```shell
$ npm install Juglans
```
2. Init a Juglans Instance
```shell
const app = new Juglans({ name: 'Juglans V1.0' })
app
.Config(config)
.Inject(inject)
.Use(...middle)
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

## API
1.set app config

2.inject your custom injects

3.import your plugins

4.run app

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
