// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

class Lifecycle extends Object {
  constructor (args) {
    super(args)
    this.hooks = []
    this.numStarted = 0
  }
  Append (...args) {
    this.hooks = this.hooks.concat(args)
  }
  async Start (ctx) {
    for (const hook of this.hooks) {
      if (hook.onStart != null) {
        try {
          await hook.onStart(ctx)
        } catch (err1) {
          try {
            await hook.onStop(ctx)
          } catch (err2) {
            throw new Error(`${err1},${err2}`)
          }
        }
      }
    }
  }
  async Stop (ctx) {
    let err
    for (let index = 0; index < this.numStarted; index++) {
      const hook = this.hooks[index]
      if (hook.onStop === null) {
        continue
      }
      try {
        await hook.onStop(ctx)
      } catch (err1) {
        err = new Error(`${err},${err1}`)
      }
      if (err !== null) {
        throw err
      }
    }
  }
}

module.exports = Lifecycle
