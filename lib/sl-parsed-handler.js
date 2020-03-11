/**
 * Copyright 2018 MaddHacker
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

const path = require('path');
const url = require('url');

const stringz = require('string-utilz');

const con = require('./sl-content');

/**
 * Set of request handler methods that should be useful for whomever consumes this npm.
 */
class slDynamicHandler {
    /**
     * Takes an instance of slUtils for output and other utilities
     * 
     * @param {slUtils}
     * @param {slHandler}
     * @param {string} _dynamicPath
     * 
     * @see slUtils
     */
    constructor(utilz, handler, dynamicPath) {
        this.utilz = utilz || (new (require('./sl-utils'))());
        /* run a file-based server? */
        this.slHandler = (handler || null);
        /* dynamic library path => pull and parse all files */
        this._dynamicPath = (dynamicPath || '');

        this._methods = {};
    }

    /**
     * Dumps the properties of this object to the logs at debug level
     */
    _logInfo() {
        this.o.d('Utilz: ' + JSON.stringify(this.utilz));
        this.o.d('Handler: ' + JSON.stringify(this.slHandler));
        this.o.d('DyanmicPath: ' + this._dynamicPath);
        return true;
    }

    /**
     * Internal shortcut to get the output handle
     * 
     * @return {output-manager} instance
     */
    get o() { return this.utilz._out; }

    /**
     * Get where the dynamicPath (on the filesystem) is at the moment
     * 
     * This should be relative to the app root without the leading or trailing slashes
     * 
     * @return {string}
     */
    get dynamicPath() { return this._dynamicPath; }

    /**
     * set a new dynamticPath (on the filesystem)
     * 
     * @param {string} path => This should be relative to the app root without the leading or trailing slashes
     */
    set dynamicPath(path) { this._dynamicPath = path; }

    /**
     * Simple helper to parse the urlPath from the request
     * 
     * @param {Http.Request}
     * @return {string}
     */
    _getUrlPath(request) { return this.utilz._getUrlPath(request); }

    /**
     * simple helper to parse the query object from the request
     * 
     * @param {Http.Request}
     * @return {string}
     */
    _getQuery(request) { return this.utilz._getQuery(request); }

    /**
     * from the given {string} dynamicPath will load all files recursively and generate requests that match the fs structure.
     * 
     * reads type as first part of request [GET, PUT, POST, DELETE] and builds API based on filesystem structure.
     * 
     * e.g. ...
     * 
     * A filesystem that looks like:
     * _dynamicRoot = api
     * 
     * api/users.js
     *   -> get(id)
     *   -> put(obj)
     *   -> post(id, obj)
     *   -> delete(id)
     *   -> getByName(name)
     * api/orders.js
     *   -> get(id)
     *   -> put(obj)
     *   -> post(id,obj)
     *   -> delete(id)
     * 
     * will generate the following:
     * 
     * GET users/{id}
     * GET users/byName/{name}
     * GET orders/{id}
     * PUT users {obj}
     * PUT orders {obj}
     * POST users/{id} {obj}
     * POST orders/{id} {obj}
     * DELETE users/{id}
     * DELETE orders/{id}
     * 
     * populates the {hash} _methods object of this class
     */
    _loadFromPath() {

    }
}

module.exports = slDynamicHandler;