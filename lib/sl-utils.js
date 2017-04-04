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

const fs = require('fs');
const path = require('path');
const url = require('url');

const promise = require('promise');

const stringz = require('string-utilz');
const datez = require('date-utilz');
const om = require('output-manager');
const out = new om.Out();

const con = require('./sl-content');

/**
 * Set of utilities that should be useful for whomever consumes this npm.
 */
class slUtils {
    constructor() { }

    /**
     * Dump the `err` to `out.e` and build simple message
     * 
     * @return a simple string of name/message
     */
    static errStr(err) {
        out.e((err instanceof Object) ? JSON.stringify(err) : err);
        return stringz.fmt('%{0} - %{1}', err.name, err.message);
    }

    /**
     * Using a `filePath`, get the extension and look up the MIMEType (as well as use the data to build a {sl-content} object)
     * 
     * @param {string} filePath => path with extension to parse
     * @param {object} data => any object
     * @return {object} => map of key data
     * 
     * @see {Content} 
     * @see {sl-content}
     */
    static buildFromFilePath(filePath, data) {
        let ext = stringz.chop(path.extname(filePath), -1); // remove leading '.'
        return con.byExtension(ext, data);
    }


    /**
     * Given a `filepath` will load the data
     * 
     * Based on the promise API
     * 
     * @param {string} filePath
     * 
     * @promise fulfill({buffer} data) => file exists, is readable and was read
     * @promise reject({string} err) => file does not exist or is not readable
     * @promise readError({string} err) => file exists, but there was an error reading file
     */
    static loadDataFromFile(filePath) {
        return new promise((fulfill, reject, readError) => {
            fs.access(filePath, fs.constants.R_OK, (accessErr) => {
                if (accessErr) { reject(slUtils.errStr(accessErr)); }
                else {
                    fs.readFile(filePath, (readErr, data) => {
                        (readErr) ? readError(slUtils.errStr(readErr)) : fulfill(data);
                    });
                }
            });
        });
    }

    /**
     * Given filePath will call `loadDataFromFile(filePath)` and render the response depending on the promise that was returned
     * 
     * @param {string} filePath 
     * @param {http.ServerResponse} response =>
     * 
     * @see loadDataFromFile(filePath)
     * @see writeResponse(response,statusCode,content)
     */
    static respondWithFileFromPath(filePath, response) {
        slUtils.loadDataFromFile(filePath).then((data) => {
            out.d(stringz.fmt('Loaded file data from "%{0}"', filePath));
            slUtils.writeResponse(response, 200, slUtils.buildFromFilePath(filePath, data));
        }, (err) => {
            let msg = stringz.fmt('File at "%{0}" does not exist or could not be read.', filePath);
            out.w(stringz.fmt('%{0} MSG: "%{1}"', msg, err));
            slUtils.writeResponse(response, 404, con.text(msg));
        }, (err) => {
            let msg = stringz.fmt('File at "%{0}" encountered error during reading.', filePath);
            out.e(stringz.fmt('%{0} MSG: "%{1}"', msg, err));
            slUtils.writeResponse(response, 500, con.text(msg));
        });
    }

    /**
     * Given the information, will write the headers and response. All responses are
     * written as 'utf-8' at the moment.
     * 
     * @param {http.ServerResponse} response 
     * @param {number} statusCode => typically 200, 404 or 500
     *          defaults to `500`
     * @param {string|buffer} content
     *          defaults to 'No content returned'
     */
    static writeResponse(response, statusCode, content) {
        content = content || con.text('No content returned');
        response.writeHead(statusCode || 500, {
            // |||jbariel TODO
            // -> look at 
            //'Cache-Control': 'max-age=3600',
            //'Content-Encoding': 'gzip',
            //'ETAG': 
            //'Expires':
            //'Last-Modified':
            'Content-Language': 'en',
            'Content-Length': content.length,
            'Content-Type': content.type,
            'Date': datez.httpDate(),
            'Server': 'server-lite'
        });
        response.end(content.value, 'utf-8');
    }
}

module.exports = slUtils;
