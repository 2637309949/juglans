"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const assert = require('assert').strict;

const is = require('is');

const moment = require('moment');

function measure(start, end, ctx) {
  const delta = end - start;
  const status = ctx.status || 404;
  const timeDelta = delta < 10000 ? delta + 'ms' : Math.round(delta / 1000) + 's';
  return {
    status,
    timeDelta,
    delta
  };
}

module.exports = (_ref) => {
  let {
    record = () => {}
  } = _ref;
  return (
    /*#__PURE__*/
    function () {
      var _ref3 = _asyncToGenerator(function* (_ref2) {
        let {
          router,
          config: {
            prefix
          }
        } = _ref2;
        assert.ok(is.function(record), 'record should be func type');
        router.use(
        /*#__PURE__*/
        function () {
          var _ref4 = _asyncToGenerator(function* (ctx, next) {
            try {
              let logInfo;
              const start = Date.now();
              const accessData = ctx.state.accessData;
              const formatTime = moment().format('YYYY-MM-DD HH:mm:ss');
              const reqForm = {
                ip: ctx.ip,
                accessData,
                reqMethod: ctx.method.toUpperCase(),
                reqUrl: ctx.request.url.toLowerCase(),
                reqHeaders: ctx.headers,
                reqQuery: ctx.query,
                reqBody: ctx.request.body,
                _created: moment().unix(),
                _creator: 'system'
              };

              if (accessData) {
                reqForm.accessData = accessData;

                if (reqForm.requestUrl.startsWith(prefix)) {
                  logInfo = `${formatTime} [${reqForm.accessData.username}] ${reqForm.reqMethod} ${reqForm.reqUrl}`;
                  yield record(reqForm);
                }
              } else if (ctx.state.fakeToken) {
                logInfo = `${formatTime} [FAKE TOKEN]: ${reqForm.reqMethod} ${reqForm.reqUrl}`;
              } else if (ctx.state.fakeUrl) {
                logInfo = `${formatTime} [FAKE URL]: ${reqForm.reqMethod} ${reqForm.reqUrl}`;
              } else {
                logInfo = `${formatTime} [UNAUTHORIZED]: ${reqForm.reqMethod} ${reqForm.reqUrl}`;
              }

              yield next();
              const {
                timeDelta,
                status
              } = measure(start, Date.now(), ctx);
              console.log(`=> ${logInfo} ${status} ${timeDelta}`);
            } catch (err) {
              throw err;
            }
          });

          return function (_x2, _x3) {
            return _ref4.apply(this, arguments);
          };
        }());
      });

      return function (_x) {
        return _ref3.apply(this, arguments);
      };
    }()
  );
};