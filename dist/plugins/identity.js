"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-09 16:55:19
 * @modify date 2019-01-09 16:55:19
 * @desc [user identity]
 */

/* =================== USAGE ===================
app.Use(Identity({
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
  fakeTokens: ['DEBUG'],
  fakeUrls: [ /\/api\/v1\/upload\/.*$/, /\/api\/v1\/favicon\.ico$/ ],
  store: {
    saveToken: redis.hooks.saveToken,
    revokeToken: redis.hooks.revokeToken,
    findToken: redis.hooks.findToken,
  }
}))
=============================================== */
const assert = require('assert').strict;

const moment = require('moment');

const is = require('is');

const utils = require('../utils');
/**
 * skip some spec route or token
 */


function fakeVerify(_x, _x2) {
  return _fakeVerify.apply(this, arguments);
}
/**
 * Identity contructor
 */


function _fakeVerify() {
  _fakeVerify = _asyncToGenerator(function* (reqPath, _ref) {
    let {
      fakeTokens,
      fakeUrls,
      accessToken
    } = _ref;
    const fakeTokensIndex = fakeTokens.findIndex(x => x === accessToken);
    const fakeUrlsIndex = fakeUrls.findIndex(x => {
      if (is.regexp(x) && x.test(reqPath)) {
        return true;
      } else if (is.string(x) && x === reqPath) {
        return true;
      } else {
        return false;
      }
    });
    return {
      isFakeTokens: fakeTokensIndex !== -1,
      isFakeUrls: fakeUrlsIndex !== -1
    };
  });
  return _fakeVerify.apply(this, arguments);
}

module.exports = function Identity(_ref2) {
  let {
    auth,
    expiresIn = 24,
    fakeUrls = [],
    fakeTokens = [],
    route = {
      obtainToken: '/obtainToken',
      revokeToken: '/revokeToken',
      refleshToken: '/refleshToken',
      identityToken: '/identityToken'
    },
    store: {
      saveToken,
      revokeToken,
      findToken
    } = {}
  } = _ref2;

  if (!(this instanceof Identity)) {
    return new Identity({
      auth,
      expiresIn,
      fakeUrls,
      fakeTokens,
      route,
      store: {
        saveToken,
        revokeToken,
        findToken
      }
    });
  }

  assert.ok(is.function(revokeToken), 'revokeToken can not be empty!');
  assert.ok(is.function(findToken), 'findToken can not be empty!');
  assert.ok(is.function(saveToken), 'saveToken can not be empty!');
  assert.ok(is.number(expiresIn), 'expiresIn can not be empty!');
  assert.ok(is.function(auth), 'auth can not be empty!');
  assert.ok(is.array(fakeTokens), 'fakeTokens should be array!');
  assert.ok(is.array(fakeUrls), 'fakeUrls should be array!');
  this.options = {
    auth,
    expiresIn,
    fakeUrls,
    fakeTokens,
    route,
    saveToken,
    revokeToken,
    findToken
  };
};
/**
 * get data after auth by iden plugin
 */


module.exports.getAccessData =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(function* (ctx) {
    return ctx.state.accessData;
  });

  return function (_x3) {
    return _ref3.apply(this, arguments);
  };
}();
/**
 * set data after auth by iden plugin
 */


function setAccessData(_x4, _x5) {
  return _setAccessData.apply(this, arguments);
}
/**
 * get data after auth by iden plugin
 */


function _setAccessData() {
  _setAccessData = _asyncToGenerator(function* (ctx, data) {
    ctx.state.accessData = data;
  });
  return _setAccessData.apply(this, arguments);
}

module.exports.getAccessToken =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(function* (ctx) {
    return ctx.state.accessToken;
  });

  return function (_x6) {
    return _ref4.apply(this, arguments);
  };
}();
/**
 * set data after auth by iden plugin
 */


function setAccessToken(_x7, _x8) {
  return _setAccessToken.apply(this, arguments);
}
/**
 * obtainToken user request and gen token and save token
 */


function _setAccessToken() {
  _setAccessToken = _asyncToGenerator(function* (ctx, accessToken) {
    ctx.state.accessToken = accessToken;
  });
  return _setAccessToken.apply(this, arguments);
}

module.exports.prototype.obtainToken =
/*#__PURE__*/
function () {
  var _ref5 = _asyncToGenerator(function* (data) {
    const {
      expiresIn,
      saveToken
    } = this.options;
    const accessToken = utils.randomStr(32);
    const refreshToken = utils.randomStr(32);
    const created = moment().unix();
    const updated = moment().unix();
    const expired = moment().add(expiresIn, 'hour').unix();
    yield saveToken({
      accessToken,
      refreshToken,
      created,
      updated,
      expired,
      extra: data
    });
    return {
      accessToken,
      refreshToken,
      created,
      updated,
      expired
    };
  });

  return function (_x9) {
    return _ref5.apply(this, arguments);
  };
}();
/**
 * auth request token
 */


module.exports.prototype.authToken =
/*#__PURE__*/
function () {
  var _ref6 = _asyncToGenerator(function* (accessToken) {
    const {
      findToken
    } = this.options;
    const token = yield findToken(accessToken);
    const now = moment().unix();

    if (!token) {
      return false;
    } else if (now > token.expired) {
      return false;
    } else {
      return true;
    }
  });

  return function (_x10) {
    return _ref6.apply(this, arguments);
  };
}();

module.exports.prototype.plugin = function (_ref7) {
  let {
    router
  } = _ref7;
  const {
    auth,
    expiresIn,
    fakeUrls,
    fakeTokens,
    route,
    saveToken,
    revokeToken,
    findToken
  } = this.options;
  const obtainToken = this.obtainToken.bind(this);
  const authToken = this.authToken.bind(this);
  router.use(
  /*#__PURE__*/
  function () {
    var _ref8 = _asyncToGenerator(function* (ctx, next) {
      const body = ctx.request.body;
      const accessToken = ctx.query['accessToken'] || body['accessToken'] || ctx.cookies.get('accessToken') || ctx.get('Authorization') || ctx.get('accessToken');
      yield setAccessToken(ctx, accessToken);
      yield next();
    });

    return function (_x11, _x12) {
      return _ref8.apply(this, arguments);
    };
  }());
  router.post(route.obtainToken,
  /*#__PURE__*/
  function () {
    var _ref9 = _asyncToGenerator(function* (ctx) {
      try {
        const ret = yield auth(ctx);

        if (ret) {
          const data = yield obtainToken(ret);
          ctx.body = {
            errcode: null,
            errmsg: null,
            data
          };
        } else {
          ctx.body = {
            errcode: 500,
            errmsg: 'user authentication failed!'
          };
        }
      } catch (error) {
        console.error(error);
        ctx.body = {
          errcode: 500,
          errmsg: error.message
        };
      }
    });

    return function (_x13) {
      return _ref9.apply(this, arguments);
    };
  }());
  router.get(route.identityToken,
  /*#__PURE__*/
  function () {
    var _ref10 = _asyncToGenerator(function* (ctx) {
      try {
        const accessToken = yield module.exports.getAccessToken(ctx);
        const data = yield findToken(accessToken);

        if (!data) {
          ctx.body = {
            errcode: null,
            errmsg: null,
            data: 'token invalid'
          };
        } else {
          ctx.body = {
            errcode: null,
            errmsg: null,
            data: data.extra
          };
        }
      } catch (error) {
        console.error(error);
        ctx.body = {
          errcode: 500,
          errmsg: error.message
        };
      }
    });

    return function (_x14) {
      return _ref10.apply(this, arguments);
    };
  }());
  router.post(route.revokeToken,
  /*#__PURE__*/
  function () {
    var _ref11 = _asyncToGenerator(function* (ctx) {
      try {
        const accessToken = yield module.exports.getAccessToken(ctx);
        yield revokeToken(accessToken);
        ctx.body = {
          errcode: null,
          errmsg: null,
          data: 'ok'
        };
      } catch (error) {
        console.error(error);
        ctx.body = {
          errcode: 500,
          errmsg: error.message
        };
      }
    });

    return function (_x15) {
      return _ref11.apply(this, arguments);
    };
  }());
  router.post(route.refleshToken,
  /*#__PURE__*/
  function () {
    var _ref12 = _asyncToGenerator(function* (ctx) {
      try {
        const accessToken = yield module.exports.getAccessToken(ctx);
        const data = yield findToken(accessToken);

        if (!data) {
          ctx.body = {
            errcode: null,
            errmsg: null,
            data: 'refleshToken invalid'
          };
        } else {
          // 重建token
          yield revokeToken(accessToken);
          data.accessToken = utils.randomStr(32);
          data.updated = moment().unix();
          data.expired = moment().add(expiresIn, 'hour').unix();
          yield saveToken(data);
          ctx.body = {
            errcode: null,
            errmsg: null,
            data
          };
        }
      } catch (error) {
        console.error(error);
        ctx.body = {
          errcode: 500,
          errmsg: error.message
        };
      }
    });

    return function (_x16) {
      return _ref12.apply(this, arguments);
    };
  }());
  router.use(
  /*#__PURE__*/
  function () {
    var _ref13 = _asyncToGenerator(function* (ctx, next) {
      try {
        const accessToken = yield module.exports.getAccessToken(ctx);
        const {
          isFakeTokens,
          isFakeUrls
        } = yield fakeVerify(ctx.path, {
          fakeTokens,
          fakeUrls,
          accessToken
        });

        if (isFakeUrls) {
          ctx.state.fakeUrl = true;
          yield next();
        } else if (isFakeTokens) {
          ctx.state.fakeToken = true;
          yield next();
        } else {
          const ret = yield authToken(accessToken);

          if (!ret) {
            ctx.body = {
              errcode: 500,
              errmsg: 'invalid token'
            };
          } else {
            const token = yield findToken(accessToken);
            yield setAccessData(ctx, token.extra);
            yield next();
          }
        }
      } catch (error) {
        ctx.body = {
          errcode: 500,
          errmsg: error.message
        };
      }
    });

    return function (_x17, _x18) {
      return _ref13.apply(this, arguments);
    };
  }());
};