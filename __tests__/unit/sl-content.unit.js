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

describe('Content (Unit)', () => {
    describe('Generic binary objects', () => {
        let bin = con.binary(elo);
        it('should not be null', () => {
            expect(bin).not.toBeNull();
        });
        it('should be of type application/octet-stream', () => {
            expect(bin.type).toBe('application/octet-stream' + typeCharset);
        });
        it('should set value correctly', () => {
            expect(bin.value).toBe(elo);
        });
        it('should have correct length', () => {
            expect(bin.length).toBe(elo.length);
        });
    });
    describe('Generic text objects', () => {
        let txt = con.text(elo);
        it('should not be null', () => {
            expect(txt).not.toBeNull();
        });
        it('should be of type text/plain', () => {
            expect(txt.type).toBe('text/plain' + typeCharset);
        });
        it('should set value correctly', () => {
            expect(txt.value).toBe(elo);
        });
        it('should have correct length', () => {
            expect(txt.length).toBe(elo.length);
        });
    });
    describe('Generic custom objects', () => {
        let ctm = con.custom('bob/frank', elo);
        it('should not be null', () => {
            expect(ctm).not.toBeNull();
        });
        it('should be of type bob/frank', () => {
            expect(ctm.type).toBe('bob/frank' + typeCharset);
        });
        it('should set value correctly', () => {
            expect(ctm.value).toBe(elo);
        });
        it('should have correct length', () => {
            expect(ctm.length).toBe(elo.length);
        });
    });
    describe('Check find by extension (xml)', () => {
        let xml = con.byExtension('xml', elo);
        it('should not be null', () => {
            expect(xml).not.toBeNull();
        });
        it('should be of type application/xml', () => {
            expect(xml.type).toBe('application/xml' + typeCharset);
        });
        it('should set value correctly', () => {
            expect(xml.value).toBe(elo);
        });
        it('should have correct length', () => {
            expect(xml.length).toBe(elo.length);
        });
    });
    describe('Check find by extension (js)', () => {
        let js = con.byExtension('js', elo);
        it('should not be null', () => {
            expect(js).not.toBeNull();
        });
        it('should be of type application/javascript', () => {
            expect(js.type).toBe('application/javascript' + typeCharset);
        });
        it('should set value correctly', () => {
            expect(js.value).toBe(elo);
        });
        it('should have correct length', () => {
            expect(js.length).toBe(elo.length);
        });
    });
    describe('Check find by extension (css)', () => {
        let css = con.byExtension('css', elo);
        it('should not be null', () => {
            expect(css).not.toBeNull();
        });
        it('should be of type text/css', () => {
            expect(css.type).toBe('text/css' + typeCharset);
        });
        it('should set value correctly', () => {
            expect(css.value).toBe(elo);
        });
        it('should have correct length', () => {
            expect(css.length).toBe(elo.length);
        });
    });
    // describe('Check all extensions', ()=>{
    //     for (let ext in con.mimeTypes) {
    //         let tmp = con.byExtension(ext, elo);
    //         let expectedType = con.mimeTypes[ext];
    //         it(ext + ' should not be null', ()=>{
    //             expect(tmp).not.toBeNull();
    //         });
    //         it(ext + ' should be of type ' + expectedType, ()=>{
    //             expect(tmp.type).toBe(expectedType + typeCharset);
    //         });
    //         it(ext + ' should set value correctly', ()=>{
    //             expect(tmp.value).toBe(elo);
    //         });
    //         it(ext + ' should have correct length', ()=>{
    //             expect(tmp.length).toBe(elo.length);
    //         });
    //     }
    // });
});
