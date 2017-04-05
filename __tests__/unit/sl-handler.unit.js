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

const stringz = require('string-utilz');
const om = require('output-manager');
const out = new om.Out();

const con = require('../../lib/sl-content');
const utilz = new (require('../../lib/sl-utils'))(out);
const handler = new (require('../../lib/sl-handler'))(utilz);

class Request {
    constructor(path) {
        this.url = path || '/';
    }
}

class Response {
    constructor() {
        this._head = {};
        this._statusCode = 0;
        this._content = '';
        this._encoding = '';
    }

    writeHead(code, headers) {
        this._statusCode = code;
        this._head = headers;
    }

    end(data, encoding) {
        this._content = data;
        this._encoding = encoding;
    }
}

const knownFile = '__test/testfile.out';
const nonexistantFile = '__test/nope.bin';
const webappRoot = 'webapp';
const indexPath = '/html/index.html';
const jsConcatPath = '/js/concat/';
const cssConcatPath = '/css/concat/';

describe('sl-handler (Unit)', () => {
    describe('Check no slUtils given on construtor', () => {
        it('should use a default implemenation of slUtils when no slUtils given on constructor', () => {
            let tmpHandler = new (require('../../lib/sl-handler'))();
            expect(tmpHandler._logInfo()).toBe(true);
        });
    });
    describe('Check given slUtils defaults', () => {
        it('should use a given implemenation of slUtils given on constructor', () => {
            expect(handler._logInfo()).toBe(true);
        });
    });
    describe('Check get/set webRoot', () => {
        it('should have no webRoot set to start', () => {
            expect(handler.webRoot).toBe('');
            expect(handler._webappRoot).toBe('');
            expect(handler._webappRoot).toBe(handler.webRoot);
        });
        it('should get/set webRoot when given/asked', () => {
            handler.webRoot = webappRoot;
            expect(handler.webRoot).toBe(webappRoot);
            expect(handler._webappRoot).toBe(webappRoot);
            expect(handler._webappRoot).toBe(handler.webRoot);
        });
    });
    describe('Check get/set indexPath', () => {
        it('should have no indexPath set to start', () => {
            expect(handler.indexPath).toBe('');
            expect(handler._indexPath).toBe('');
            expect(handler._indexPath).toBe(handler.indexPath);
        });
        it('should get/set indexPath when given/asked', () => {
            handler.indexPath = indexPath;
            expect(handler.indexPath).toBe(indexPath);
            expect(handler._indexPath).toBe(indexPath);
            expect(handler._indexPath).toBe(handler.indexPath);
        });
    });
    describe('Check get/set concatenateJavscriptFolderPath', () => {
        it('should have no concatenateJavscriptFolderPath set to start', () => {
            expect(handler.concatenateJavscriptFolderPath).toBe('');
            expect(handler._concatJsFolderPath).toBe('');
            expect(handler._concatJsFolderPath).toBe(handler.concatenateJavscriptFolderPath);
        });
        it('should get/set concatenateJavscriptFolderPath when given/asked', () => {
            handler.concatenateJavscriptFolderPath = jsConcatPath;
            expect(handler.concatenateJavscriptFolderPath).toBe(jsConcatPath);
            expect(handler._concatJsFolderPath).toBe(jsConcatPath);
            expect(handler._concatJsFolderPath).toBe(handler.concatenateJavscriptFolderPath);
        });
    });
    describe('Check get/set concatenateCssFolderPath', () => {
        it('should have no concatenateCssFolderPath set to start', () => {
            expect(handler.concatenateCssFolderPath).toBe('');
            expect(handler._concatCssFolderPath).toBe('');
            expect(handler._concatCssFolderPath).toBe(handler.concatenateCssFolderPath);
        });
        it('should get/set concatenateCssFolderPath when given/asked', () => {
            handler.concatenateCssFolderPath = cssConcatPath;
            expect(handler.concatenateCssFolderPath).toBe(cssConcatPath);
            expect(handler._concatCssFolderPath).toBe(cssConcatPath);
            expect(handler._concatCssFolderPath).toBe(handler.concatenateCssFolderPath);
        });
    });
    describe('Check get URL path', () => {
        it('should return / on basic path', () => {
            expect(handler._getUrlPath(new Request())).toBe('/');
        });
        it('should be able to get more complex paths', () => {
            expect(handler._getUrlPath(new Request('/test/123/bob.js'))).toBe('/test/123/bob.js');
        });
    });
    describe('Check get query', () => {
        it('should return empty on no query', () => {
            expect(JSON.stringify(handler._getQuery(new Request()))).toBe('{}');
            expect(JSON.stringify(handler._getQuery(new Request('/test/123/bob.js')))).toBe('{}');
        });
        it('should be able to get a given query', () => {
            expect(JSON.stringify(handler._getQuery(new Request('/?files=1')))).toBe(JSON.stringify({ "files": "1" }));
            expect(JSON.stringify(handler._getQuery(new Request('/?files=1&name=bob')))).toBe(JSON.stringify({ "files": "1", "name": "bob" }));
            expect(JSON.stringify(handler._getQuery(new Request('/?files=1,2,3,4,5')))).toBe(JSON.stringify({ "files": "1,2,3,4,5" }));
            expect(JSON.stringify(handler._getQuery(new Request('/test/123/bob.js?files=1,2,3,4,5')))).toBe(JSON.stringify({ "files": "1,2,3,4,5" }));
        });
    });
});
