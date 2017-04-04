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

const utilz = require('../../lib/sl-utils');
const con = require('../../lib/sl-content');

const stringz = require('string-utilz');
const om = require('output-manager');
const out = new om.Out();

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

describe('sl-utils (Unit)', function () {
    describe('Check errStr', function () {
        it('should return a sensible string', function () {
            expect(utilz.errStr({ name: 'hi', message: 'bob' })).toBe('hi - bob');
        });
    });
    describe('Check buildFromFilePath', function () {
        it('should handle known strings (xml)', function () {
            let tmpCon = utilz.buildFromFilePath('docs/latest/wizard.xml', 'data');
            expect(tmpCon).not.toBe(null);
            expect(tmpCon.type).toBe('application/xml; charset=utf-8');
            expect(tmpCon.length).toBe(4);
        });
        it('should handle known strings (js)', function () {
            let tmpCon = utilz.buildFromFilePath('scripts/raw/fun.min.js', 'data');
            expect(tmpCon).not.toBe(null);
            expect(tmpCon.type).toBe('application/javascript; charset=utf-8');
            expect(tmpCon.length).toBe(4);
        });
        it('should handle unknown strings (boo)', function () {
            let tmpCon = utilz.buildFromFilePath('ghost/says.boo', 'data');
            expect(tmpCon).not.toBe(null);
            expect(tmpCon.type).toBe('application/octet-stream; charset=utf-8');
            expect(tmpCon.length).toBe(4);
        });
    });
    describe('Check loadDataFromFile', function () {
        it('should throw an error when a file does not exist', function () {
            utilz.loadDataFromFile('unreadable.bin').then(
                () => { throw Error('should not be sucessful'); },
                (err) => { expect(err).not.toBe(null); },
                () => { throw Error('should not have tried to read it'); });
        });
        it('should be able to load a file', function () {
            utilz.loadDataFromFile('.gitignore').then(
                (data) => { expect(stringz.startsWith(data, 'node_modules')).toBe(true); },
                (err) => { throw Error('should not have been able to read or find it'); },
                (err) => { throw Error('should not have tried to read it'); });
        });
    });
    describe('Check respondWithFileFromPath', function () {
        it('should return a 404 when a file does not exist', function () {
            let myResponse = new Response();
            utilz.respondWithFileFromPath('unreadable.bin', myResponse);
            out.i(JSON.stringify(myResponse._head));
            expect(myResponse._head).not.toBe(null);
            // expect(myResponse._head['Server']).toBe('server-lite');
            // expect(myResponse._head['Content-Language']).toBe('en');
            // expect(myResponse._head['Content-Type']).toBe('text/plain');
            // expect(myResponse._statusCode).toBe(404);
            // expect(stringz.startsWith(myResponse._content, 'File at')).toBe(true);
            // expect(myResponse._encoding).toBe('utf-8');
        });
        it('should be able to load a file', function () {
            let myResponse = new Response();
            utilz.respondWithFileFromPath('.gitignore', myResponse);
            expect(myResponse._head).not.toBe(null);
            // expect(myResponse._head['Server']).toBe('server-lite');
            // expect(myResponse._head['Content-Language']).toBe('en');
            // expect(myResponse._head['Content-Type']).toBe('application/octet-stream');
            // expect(myResponse._statusCode).toBe(200);
            // expect(stringz.startsWith(myResponse._content, 'node_modules')).toBe(true);
            // expect(myResponse._encoding).toBe('utf-8');
        });
    });
    describe('Check writeResponse', function () {
        it('should handle good input', function () {
            let myResponse = new Response();
            utilz.writeResponse(myResponse, 200, con.text('say hi'));
            expect(myResponse._head).not.toBe(null);
            expect(myResponse._head['Server']).toBe('server-lite');
            expect(myResponse._head['Content-Language']).toBe('en');
            expect(myResponse._head['Content-Length']).toBe(6);
            expect(myResponse._head['Content-Type']).toBe('text/plain; charset=utf-8');
            expect(myResponse._head['Date']).not.toBe(null);
            expect(myResponse._statusCode).toBe(200);
            expect(myResponse._content).toBe('say hi');
            expect(myResponse._encoding).toBe('utf-8');
        });
        it('should be able to handle no status', function () {
            let myResponse = new Response();
            utilz.writeResponse(myResponse, null, con.text('say hi'));
            expect(myResponse._head).not.toBe(null);
            expect(myResponse._head['Server']).toBe('server-lite');
            expect(myResponse._head['Content-Language']).toBe('en');
            expect(myResponse._head['Content-Length']).toBe(6);
            expect(myResponse._head['Content-Type']).toBe('text/plain; charset=utf-8');
            expect(myResponse._head['Date']).not.toBe(null);
            expect(myResponse._statusCode).toBe(500);
            expect(myResponse._content).toBe('say hi');
            expect(myResponse._encoding).toBe('utf-8');
        });
        it('should be able to handle no content', function () {
            let myResponse = new Response();
            utilz.writeResponse(myResponse, 404, null);
            expect(myResponse._head).not.toBe(null);
            expect(myResponse._head['Server']).toBe('server-lite');
            expect(myResponse._head['Content-Language']).toBe('en');
            expect(myResponse._head['Content-Length']).toBe(19);
            expect(myResponse._head['Content-Type']).toBe('text/plain; charset=utf-8');
            expect(myResponse._head['Date']).not.toBe(null);
            expect(myResponse._statusCode).toBe(404);
            expect(myResponse._content).toBe('No content returned');
            expect(myResponse._encoding).toBe('utf-8');
        });
    });
});