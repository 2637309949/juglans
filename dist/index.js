"use strict";

/**
 * @author [Double]
 * @email [2637309949@mail.com]
 * @create date 2018-09-02 12:51:45
 * @modify date 2018-09-02 12:51:45
 * @desc [export root object]
*/
module.exports = require('./application');
module.exports.utils = require('./utils'); // Juglans default config

module.exports.defaultConfig = {
  'name': 'Juglans V1.0',
  'prefix': '/api/v1',
  'port': 3000,
  'debug': true,
  'logger': {
    'service': 'Juglans V1.0',
    'maxsize': 10240,
    'path': ''
  },
  'bodyParser': {
    'strict': false,
    'jsonLimit': '5mb',
    'formLimit': '1mb',
    'textLimit': '1mb',
    'multipart': true,
    'formidable': {
      'keepExtensions': true
    }
  }
};