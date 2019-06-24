"use strict";

// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.
module.exports = require('./app');
module.exports.utils = require('./utils');
module.exports.events = require('./events'); // Juglans default config

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
    'parsedMethods': ['POST', 'PUT', 'PATCH', 'DELETE'],
    'jsonLimit': '5mb',
    'formLimit': '1mb',
    'textLimit': '1mb',
    'multipart': true,
    'formidable': {
      'keepExtensions': true
    }
  }
};