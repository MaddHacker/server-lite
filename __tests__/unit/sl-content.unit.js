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

const con = require('../../lib/sl-content');

const typeCharset = '; charset=utf-8';
const elo = 'hello';

describe('Content (Unit)', function () {
    describe('Generic binary objects', function () {
        let bin = con.binary(elo);
        it('should not be null', function () {
            expect(bin).not.toBe(null);
        });
        it('should be of type application/octet-stream', function () {
            expect(bin.type).toBe('application/octet-stream' + typeCharset);
        });
        it('should set value correctly', function () {
            expect(bin.value).toBe(elo);
        });
        it('should have correct length', function () {
            expect(bin.length).toBe(elo.length);
        });
    });
    describe('Generic text objects', function () {
        let txt = con.text(elo);
        it('should not be null', function () {
            expect(txt).not.toBe(null);
        });
        it('should be of type text/plain', function () {
            expect(txt.type).toBe('text/plain' + typeCharset);
        });
        it('should set value correctly', function () {
            expect(txt.value).toBe(elo);
        });
        it('should have correct length', function () {
            expect(txt.length).toBe(elo.length);
        });
    });
    describe('Generic custom objects', function () {
        let ctm = con.custom('bob/frank', elo);
        it('should not be null', function () {
            expect(ctm).not.toBe(null);
        });
        it('should be of type bob/frank', function () {
            expect(ctm.type).toBe('bob/frank' + typeCharset);
        });
        it('should set value correctly', function () {
            expect(ctm.value).toBe(elo);
        });
        it('should have correct length', function () {
            expect(ctm.length).toBe(elo.length);
        });
    });
    describe('Check find by extension (xml)', function () {
        let xml = con.byExtension('xml', elo);
        it('should not be null', function () {
            expect(xml).not.toBe(null);
        });
        it('should be of type application/xml', function () {
            expect(xml.type).toBe('application/xml' + typeCharset);
        });
        it('should set value correctly', function () {
            expect(xml.value).toBe(elo);
        });
        it('should have correct length', function () {
            expect(xml.length).toBe(elo.length);
        });
    });
    describe('Check find by extension (js)', function () {
        let js = con.byExtension('js', elo);
        it('should not be null', function () {
            expect(js).not.toBe(null);
        });
        it('should be of type application/javascript', function () {
            expect(js.type).toBe('application/javascript' + typeCharset);
        });
        it('should set value correctly', function () {
            expect(js.value).toBe(elo);
        });
        it('should have correct length', function () {
            expect(js.length).toBe(elo.length);
        });
    });
    describe('Check find by extension (css)', function () {
        let css = con.byExtension('css', elo);
        it('should not be null', function () {
            expect(css).not.toBe(null);
        });
        it('should be of type text/css', function () {
            expect(css.type).toBe('text/css' + typeCharset);
        });
        it('should set value correctly', function () {
            expect(css.value).toBe(elo);
        });
        it('should have correct length', function () {
            expect(css.length).toBe(elo.length);
        });
    });
    // describe('Check all extensions', function () {
    //     for (let ext in con.mimeTypes) {
    //         let tmp = con.byExtension(ext, elo);
    //         let expectedType = con.mimeTypes[ext];
    //         it(ext + ' should not be null', function () {
    //             expect(tmp).not.toBe(null);
    //         });
    //         it(ext + ' should be of type ' + expectedType, function () {
    //             expect(tmp.type).toBe(expectedType + typeCharset);
    //         });
    //         it(ext + ' should set value correctly', function () {
    //             expect(tmp.value).toBe(elo);
    //         });
    //         it(ext + ' should have correct length', function () {
    //             expect(tmp.length).toBe(elo.length);
    //         });
    //     }
    // });
});
