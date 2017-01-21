/**
 * Copyright 2017 MaddHacker
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/**
 * Core file. Should be able to just call this file to start with: node index.js
 * And the server should start up.
 * 
 */

/**
 * Global output manager
 */
O = require('output-manager');
const server = require('./server');

__IS_TRACE = false;
__IS_DEBUG = false;

if (__IS_DEBUG || __IS_TRACE) {
    O.level(((__IS_TRACE) ? O.LogLevel.TRACE : O.LogLevel.DEBUG));
}

/*
 * SERVER INFORMATION
 */
__serverPort = 8888;
// __serverPortSec = 8889;
// __serverSecKey = '../certs/ss-key.pem';
// __serverSecCert = '../certs/ss-cert.pem';
__webappRoot = 'webapp';

/*
 * START THE SERVER
 */
server.start();
// server.startSec();
