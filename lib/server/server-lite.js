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
 * Custom exception
 * 
 * @param {String} err
 * @param {String} cause
 * @returns {object} ServerLiteException that can be accessed for more information
 *  
 * properties are:      
 *    name {String} => name of the error. defaults to 'ServerLiteException'
 *    type {String} => defaults to 'ServerLiteException'
 *    message {String} => message provided when error was generated
 *    cause {String} => deeper cause
 *    fileName {String} => defaults to 'server.js'
 *    lineNumber {String} => line number of exception (if provided)
 *    stack {String} => call stack of error
 *    toString() {function} => clean print of message + cause
 */
function ServerLiteException(err, cause) {
    var rtn = {
        name: 'ServerLiteException',
        type: 'ServerLiteException',
        message: '',
        cause: cause,
        fileName: 'server.js',
        lineNumber: '',
        stack: '',
        toString: function () {
            return this.message + ' ::: ' + this.cause;
        }
    };

    if (typeof err === 'object' && err.name === 'Error') {
        rtn.name = err.name;
        rtn.message = err.message;
        rtn.fileName = err.fileName || 'server.js';
        rtn.lineNumber = err.lineNumber;
        rtn.stack = err.stack;
    }
    return rtn;
}

/**
 * Abstract implementation of a ServerLite object, will allow for secure or 
 * non-secure server to be created
 */

/**
 * Constructor for the ServerLite object
 * 
 * @param {ServerLiteConfig} config => information about the server on init
 * 
 */
function ServerLite(config) {
    if (!(config instanceof ServerLiteConfig)) {
        throw ServerLiteException(
            new Error('Given tokens must be an instance of ServerLiteConfig'),
            'tokens must be an instance of ServerLiteConfig that contains server info');
    }

    const svr = this;

    svr.__config = config;
};

/**
 * Holds all config for the {ServerLite} object
 * 
 * @see {ServerLiteConfig}
 */
ServerLite.prototype.__config;

/**
 * Holds the server object, so it can be refereneced as needed
 */
ServerLite.prototype.__server;

/**
 * Starts the server, typically doesn't need to be overridden
 * 
 * @param protocol => typically `http` or `https`
 * @param port => port server hould be deployed on 
 */
ServerLite.prototype.start = function () {
    const svr = this;

    svr.__server = svr.__protocol.createServer(svr.__config.onRequest)
        .on('checkContinue', svr.__config.onCheckContinue)
        .on('checkExpectation', svr.__config.onCheckExpectation)
        .on('clientError', svr.__config.onClientError)
        .on('close', svr.__config.onClose)
        .on('connect', svr.__config.onConnect)
        .on('connection', svr.__config.onConnection)
        .on('upgrade', svr.__config.onUpgrade)
        .listen(svr.__config.__port);

    svr.__config.out.i('Server started on port ' + svr.__config.__port);
}

/**
 * Stops the server
 */
ServerLite.prototype.stop = function () {
    const svr = this;
    svr.__server.stop();
}

/**
 * Configuration for a ServerLite
 * 
 * @param {Hash} => elements to override
 * possible params are: 
 *   protocol {http|https} => protocol to use for server.
 *      defaults to `require('http')`
 *   out {output-manager} => extension or implementation of {output-manager} npm.
 *      defaults to `require('output-manager')`
 *   port {Number} => port server should be published on. 
 *      defaults to `5000`
 * 
 *   (All the callbacks that should be used for the server):
 *     onCheckContinue {function} => ServerLiteConfig.__defaultOnCheckContinue,
 *     onCheckExpectation {function} => ServerLiteConfig.__defaultOnCheckExpectation,
 *     onClientError {function} => ServerLiteConfig.__defaultOnClientError,
 *     onClose {function} => ServerLiteConfig.__defaultOnClose,
 *     onConnect {function} => ServerLiteConfig.__defaultOnConnect,
 *     onConnection {function} => ServerLiteConfig.__defaultOnConnection,
 *     onRequest {function} => ServerLiteConfig.__defaultOnRequest,
 *     onUpgrade {function} => ServerLiteConfig.__defaultOnUpgrade
 * 
 * @see {http}
 * @see {https}
 * @see {output-manager}
 * @see #__defaultOnCheckContinue
 * @see #__defaultOnCheckExpectation
 * @see #__defaultOnClientError
 * @see #__defaultOnClose
 * @see #__defaultOnConnect
 * @see #__defaultOnConnection
 * @see #__defaultOnRequest
 * @see #__defaultOnUpgrade
 * 
 */
function ServerLiteConfig(params) {
    var cfg = this;
    cfg.protocol = (params.protocol || require('http'));
    cfg.out = (params.out || require('output-manager'));
    cfg.port = (params.port || 5000);

    cfg.onCheckContinue = (params.onCheckContinue || cfg.__defaultOnCheckContinue);
    cfg.onCheckExpectation = (params.onCheckExpectation || cfg.__defaultOnCheckExpectation);
    cfg.onClientError = (params.onClientError || cfg.__defaultOnClientError);
    cfg.onClose = (params.onClose || cfg.__defaultOnClose);
    cfg.onConnect = (params.onConnect || cfg.__defaultOnConnect);
    cfg.onConnection = (params.onConnection || cfg.__defaultOnConnection);
    cfg.onRequest = (params.onRequest || cfg.__defaultOnRequest);
    cfg.onUpgrade = (params.onUpgrade || cfg.__defaultOnUpgrade);

}

/**
 * Called when the server recieves a request, should be overridden
 * 
 * @param request {http.Request} => request object
 * @param response {http.Response} => response object
 */
ServerLiteConfig.prototype.__defaultOnRequest = function (request, response) {
    const svr = this;
    svr.__config.out.d('onRequest called');
};

/**
 * Emitted when check 100 Continue is Emitted
 * 
 * SHOULD NOT BE OVERRIDDEN WITHOUT CAUSE
 * 
 * @param request {http.Request} => request object
 * @param response {http.Response} => response object
 */
ServerLiteConfig.prototype.__defaultOnCheckContinue = function (request, response) {
    const svr = this;
    response.writeContinue();
}

/**
 * Emitted when a check is emitted that isn't status 100
 * 
 * @param request {http.Request} => request object
 * @param response {http.Response} => response object
 */
ServerLiteConfig.prototype.__defaultOnCheckExpectation = function (request, response) {
    const svr = this;
    response.statusCode = 417;
    response.statusMessage = 'Exception Failed';
    response.end();
}

/**
 * Called clientError, shoudl be overridden as needed.
 * 
 * @param exception {Error} => detailed exception
 * @param socket {net.Socket} => object the error came from 
 */
ServerLiteConfig.prototype.__defaultOnClientError = function (exception, socket) {
    const svr = this;
    svr.__config.out.e('onClientError called with error: ' + exception);
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
};

/**
 * Called when the server is closed, should be overriden as needed
 */
ServerLiteConfig.prototype.__defaultOnClose = function () {
    const svr = this;
    svr.__config.out.d('onClose called');
};

/**
 * Emitted each time an HTTP CONNECT is emitted
 * 
 * @param request {http.IncomingMessage} => args for the HTTP request
 * @param socket {Socket} => between server and client
 * @param head {Buffer} => first packet of tunnel (may be empty) 
 */
SerServerLiteConfigverLite.prototype.__defaultOnConnect = function (request, socket, head) {
    const svr = this;
    svr.__config.out.t('onConnect emitted');
}

/**
 * Emitted when a new TCP stream is established
 * 
 * @param socket {net.Socket} => socket establishing stream
 */
ServerLiteConfig.prototype.__defaultOnConnection = function (socket) {
    const svr = this;
    svr.__config.out.t('onConnection emitted');
}

/**
 * Emitted for every HTTP upgrade request
 * 
 * @param request {http.IncomingMessage} => args for the HTTP request
 * @param socket {net.Socket} => socket between server and client
 * @param head {Buffer} => First packet (might be empty)
 */
ServerLiteConfig.prototype.__defaultOnUpgrade = function (request, socket, head) {
    const svr = this;
    request.close();
}

