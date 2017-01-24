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

var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var url = require('url');
var con = require('./content');

var __serverSec;
var __server;

/**
 * Start the server
 */
function start() {
    __server = http.createServer(onRequest)
        .on('close', onClose)
        .on('clientError', onClientError)
        .listen(__serverPort);
    O.i('Server started on port ' + __serverPort);
}

/**
 * Start the server
 */
function startSec() {
    __serverSec = https.createServer({
        key: (__serverSecKey) ? fs.readFileSync(__serverSecKey) : '',
        cert: (__serverSecCert) ? fs.readFileSync(__serverSecCert) : ''
    }, onRequest)
        .on('close', onCloseSec)
        .on('clientError', onClientError)
        .listen(__serverPortSec);

    O.i('Secure Server started on port ' + __serverPortSec);
}

/**
 * Stop the server
 */
function stop() {
    __server.close();
}

/**
 * Stop the secure server
 */
function stopSec() {
    __serverSec.close();
}

/**
 * Handler for all requests
 * 
 * @param request
 * @param response
 */
function onRequest(request, response) {
    O.t("HTTPVersion: '" + request.httpVersion + "'");
    var requestUrl = request.url;
    O.d("Responding to '" + requestUrl + "'");
    O.d("  pathname '" + url.parse(requestUrl).pathname + "'");
    O.d("  query '" + url.parse(requestUrl).query + "'");

    if (requestUrl.startsWith('/Twitter')) {
        O.d('Found Twitter request: ' + requestUrl);
        twitterRequest(request, response);
    } else if (requestUrl.startsWith('/var')) {
        O.d('Found variation request: ' + requestUrl);
        variationRequest(request, response);
    } else {
        O.d('Simple file based request: ' + requestUrl);
        simpleFileBasedWebServer(request, response);
    }
}

/**
 * Called onClose
 * 
 * @see stop()
 */
function onClose() {
    O.i('Server closed...');
}

/**
 * Called onCloseSec
 * 
 * @see stopSec()
 */
function onCloseSec() {
    O.i('Secure Server closed...');
}

/**
 * Called on exception, part of http library
 * 
 * @param exception
 * @param socket
 */
function onClientError(exception, socket) {
    O.e("Client error : '" + exception + "'");
}

/**
 * All our exports, just stop/start insec/sec
 */
module.exports = {
    start: start,
    startSec: startSec,
    stop: stop,
    stopSec: stopSec
};

/*******************************************************************************
 * @region helpers
 * 
 * All helpers for requests
 * 
 ******************************************************************************/

/**
 * Builds a content object based on given filepath and data.
 * 
 * @param filePath =>
 *            string value of path to file
 * @param data =>
 *            data read from given file
 * 
 * @see ./content.js
 */
function getContentFromFilePathAndData(filePath, data) {
    var extname = path.extname(filePath).substr(1); // remove leading '.'
    var tmpContent = con.text('No content returned');
    try {
        tmpContent = con[extname](data);
    } catch (exception) {
        O.w('Could not figure out what \'' + extname + '\' was!');
        if (exception) {
            if (exception.name !== 'TypeError') {
                O.w('        exception was: ' + exception.name);
                O.w('        exception message: ' + exception.message);
            }
        } else {
            O.w('    no exception was thrown');
        }
    }
    return tmpContent;
}

/**
 * Displays an 'uber' file (a concatenated file, typically js or css).
 * 
 * @param response =>
 *            response object from http library
 * @param conFxn =>
 *            name of contentFxn (e.g. 'html','css','js','xml','json')
 * @param prefix =>
 *            string prefix to find files provided
 * @param postfix =>
 *            type of files (e.g. '.js','.css')
 * @param files =>
 *            Array of files to add IN ORDER
 */
function displayUber(response, conFxn, prefix, postfix, files) {
    files = files || [];
    O.t('looking for files in ' + prefix + ' with names(' + files.length + '): ' + files);
    var allData = {};
    files.forEach(function (file) {
        var tmpFullPath = prefix + file + postfix;
        O.d('displayUber, looking for file: ' + tmpFullPath);
        getDataFromFile(tmpFullPath, {
            nonexistant: function () {
                O.w('File not found: ' + tmpFullPath);
                allData[file] = '';
            },
            error: function () {
                O.e('Error reading file: ' + tmpFullPath);
                allData[file] = '';
            },
            complete: function (data) {
                O.d('Found data for file: ' + tmpFullPath);
                O.t('        ' + data);
                allData[file] = data;
            }
        });
    });
    function awaitAll() {
        if (Object.keys(allData).length != files.length) {
            O.d('Waiting found sizes: ' + Object.keys(allData).length + ' and ' + files.length);
            setTimeout(awaitAll, 50);
        } else {
            var tmpData = '';
            // display in order provided
            files.forEach(function (key) {
                O.d('Found data for key: ' + key);
                O.t('     ' + allData[key]);
                tmpData += allData[key];
            });
            O.t('All data: ' + tmpData);
            writeResponse(response, 200, conFxn(tmpData || 'No data returned'));
        }
    }
    awaitAll();
}

/**
 * Loads the data from the given filePath
 * 
 * @param filePath =>
 *            String path that can be parsed.
 * @param callback =>
 *            will be:
 *            <ul>
 *            <li> <b>complete(data)</b> if we can find the file and read the
 *            data</li>
 *            <li> <b>error()</b> if we found the file, but could not read the
 *            data</li>
 *            <li> <b>nonexistant()</b> if we couldn't find the file</li>
 *            </ul>
 */
function getDataFromFile(filePath, callback) {
    fs.exists(filePath, function (exists) {
        if (exists) {
            fs.readFile(filePath, function (error, data) {
                if (error) {
                    callback.error();
                } else {
                    callback.complete(data);
                }
            });
        } else {
            callback.nonexistant();
        }
    });
}

/**
 * Given filePath will call <b><i>getDataFromFile(filePath,callback)</i></b>
 * and render the response depending on the callback using <b><i>writeResponse(response,statusCode,content)</i></b>
 * 
 * @param filePath =>
 *            String
 * @param response =>
 *            http response object
 * 
 * @see getDataFromFile(filePath,callback)
 * @see writeResponse(response,statusCode,content)
 */
function displayFileByPath(filePath, response) {
    getDataFromFile(filePath, {
        nonexistant: function () {
            O.w("File '" + filePath + "' doesn't exist");
            writeResponse(response, 404, con.text('File does not exist'));
        },
        error: function () {
            O.e("File + '" + filePath + "' threw error when a read was attempted");
            writeResponse(response, 500, con.text('Encountered an unknown error...'));
        },
        complete: function (data) {
            O.d("File + '" + filePath + "' was found and read...");
            writeResponse(response, 200, getContentFromFilePathAndData(filePath, data));
        }
    });
}

/**
 * Given the information, will write the headers and response. All responses are
 * written as 'utf-8' at the moment.
 * 
 * @param response =>
 *            http response object
 * @param statusCode =>
 *            Integer, typically 200, 404 or 500. <b>Will use 500 as the default
 *            statusCode if none is provided</b>
 * @param content =>
 *            Content object, <b>will use a text object that indicates no
 *            content has been returned if not provided</b>
 */
function writeResponse(response, statusCode, content) {
    content = content || con.text('No content returned');
    response.writeHead(statusCode || 500, {
        'Content-Length': content.length,
        'Content-Type': content.type
    });
    response.end(content.value, 'utf-8');
}

/*******************************************************************************
 * @regionend helpers
 ******************************************************************************/

/*******************************************************************************
 * @region file-request
 * 
 * All file-based requests
 * 
 ******************************************************************************/

/**
 * Loads a file and sends it back based on the filesystem
 * 
 * @see __webappRoot
 * @see displayFileByPath(filePath,response);
 */
function simpleFileBasedWebServer(request, response) {
    var urlPath = url.parse(request.url).pathname;
    var query = url.parse(request.url, true).query;
    var filePath = __webappRoot + ((urlPath == '/') ? '/html/index.html' : urlPath);

    if (filePath.endsWith('uber-js.js')) {
        O.d('Trying to display uber-js.js');
        if (query) {
            displayUber(response, con.js, __webappRoot + '/js/uber/', '.js', (query.files || '').split(','));
        } else {
            O.w('Request to display uber-js.js with no files provided...');
        }
    } else if (filePath.endsWith('uber-css.css')) {
        O.d('Trying to display uber-css.css');
        if (query) {
            displayUber(response, con.css, __webappRoot + '/css/uber/', '.css', (query.files || '').split(','));
        } else {
            O.w('Request to display uber-css.css with no files provided...');
        }
    } else {
        displayFileByPath(filePath, response);
    }
}

/*******************************************************************************
 * @regionend file-request
 ******************************************************************************/

/*******************************************************************************
 * @region var-request
 * 
 * All variation specific requests
 * 
 ******************************************************************************/

/**
 * Used to render alternative views while development is underway
 * 
 * @param request =>
 *            http request object
 * @param response =>
 *            http response object
 */
function variationRequest(request, response) {
    var urlObj = url.parse(request.url, true);
    var urlPath = urlObj.pathname || '/';
    if (urlPath.length > 1) {
        var otherFile = urlPath.split('/')[2];
        O.i("Displaying '" + otherFile + "'");
        var filePath = __webappRoot + '/html/' + otherFile + '.html';
        displayFileByPath(filePath, response);
    } else {
        writeResponse(response, 404, null);
    }
}

/*******************************************************************************
 * @regionend var-request
 ******************************************************************************/

/*******************************************************************************
 * @region twitter-request
 * 
 * All Twitter specific requests
 * 
 ******************************************************************************/

/**
 * Handle a /Twitter/* request.
 * 
 * @param request =>
 *            http request object
 * @param response =>
 *            http response object
 */
function twitterRequest(request, response) {
    var urlObj = url.parse(request.url, true);
    var urlPath = urlObj.pathname || '/';
    if (urlPath.length > 1) {
        var mthd = urlPath.split('/')[2];
        O.i("Executing '" + mthd + "'");
        try {
            twitterFxns[mthd](urlObj.query, getTwitterCallbacks({
                'success': function (resp) {
                    if (!resp.value) {
                        resp = con.text('[SUCCESS] No content returned');
                    }
                    O.i('[Twitter/' + mthd + ' SUCCESS] ' + resp.value);
                    writeResponse(response, 200, resp);
                },
                'failure': function (resp) {
                    if (!resp.value) {
                        resp = con.text('[FAILURE] No content returned');
                    }
                    O.w('[Twitter/' + mthd + ' FAILURE] ' + resp.value);
                    writeResponse(response, 500, resp);
                },
                'error': function (resp) {
                    if (!resp.value) {
                        resp = con.text('[ERROR] No content returned');
                    }
                    O.e('[Twitter/' + mthd + ' ERROR] ' + resp.value);
                    writeResponse(response, 500, resp);
                }
            }));
        } catch (err) {
            O.e("Error found when trying to call '" + mthd + "'");
            O.e("        with args: '" + urlObj.query + "'");
            O.e("        and err: '" + err + "'");
            writeResponse(response, 500, null);
        }
    } else {
        writeResponse(response, 404, null);
    }
}

/**
 * Default callback implementations
 */
var twitterFxnCallback = {
    'success': function (resp) {
        O.i('[DEFAULT TWITTER CALLBACK] [SUCCESS] ' + resp.value);
    },
    'failure': function (resp) {
        O.w('[DEFAULT TWITTER CALLBACK] [FAILURE] ' + resp.value);
    },
    'error': function (resp) {
        O.e('[DEFAULT TWITTER CALLBACK] [ERROR] ' + resp.value);
    }
};

/**
 * Uses the <b><i>twitterFxnCallback</i></b> as the base, replace each
 * default with the given callback implementation (if it exists)
 * 
 * @param callback =>
 *            override for <b><i>twitterFxnCallback</i></b>
 * @returns callback object that is the merged result
 * @see twitterFxnCallback
 */
function getTwitterCallbacks(callback) {
    var tmp = {};
    for (var attrname in twitterFxnCallback) {
        tmp[attrname] = twitterFxnCallback[attrname];
    }
    for (var attrname in callback) {
        tmp[attrname] = callback[attrname];
    }
    return tmp;
}

/**
 * All the functions Twitter uses
 * 
 * Each takes 2 params:
 * 
 * @param args =>
 *            arguments of the URL request
 * @param callback =>
 *            callbacks to handle the response.
 * 
 * @see getTwitterCallbacks(callback)
 * @see twitterFxnCallback
 */
var twitterFxns = {
	/**
	 * @start twitterFxns
	 */

	/**
	 * Checks the status of the twitter connection
	 * 
	 * @param args
	 * @param callback
	 */
    'status': function (args, callback) {
        callback.success(con.text((__tpsRunning) ? ('Connected') : 'Disconnected'));
    },
	/**
	 * Just tests that failures work correctly
	 * 
	 * @param args
	 * @param callback
	 */
    'testFail': function (args, callback) {
        callback.failure(con.text('This is my test failure'));
    },
	/**
	 * Just tests that errors work correctly
	 * 
	 * @param args
	 * @param callback
	 */
    'testError': function (args, callback) {
        callback.error(con.text('This is my test error'));
    }

    /**
     * @end twitterFxns
     */
};

/*******************************************************************************
 * @regionend twitter-request
 ******************************************************************************/