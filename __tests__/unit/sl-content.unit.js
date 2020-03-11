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

const elo = 'hello';

const om = require('output-manager');
const out = new om.Out();

function checkObjectInfo(tmpContent, baseType, qualifier = 'it', value = elo) {
    it(qualifier + ' should not be null', () => {
        expect(tmpContent).not.toBeNull();
    });
    it(qualifier + ' should be of correct type', () => {
        expect(tmpContent.type).toBe(con.typeString(baseType));
    });
    it(qualifier + ' should set the value correctly', () => {
        expect(tmpContent.value).toBe(value);
    });
    it(qualifier + ' should have the correct length', () => {
        expect(tmpContent.length).toBe(value.length);
    });
};

describe('Content (Unit)', () => {
    describe('Generic binary objects', () => {
        checkObjectInfo(con.binary(elo), con.mimeTypes.bin);
    });
    describe('Generic text objects', () => {
        checkObjectInfo(con.text(elo), con.mimeTypes.txt);
    });
    describe('Generic html objects', () => {
        checkObjectInfo(con.html(elo), con.mimeTypes.html);
    });
    describe('Generic json objects', () => {
        checkObjectInfo(con.json(elo), con.mimeTypes.json);
    });
    describe('Generic xml objects', () => {
        checkObjectInfo(con.xml(elo), con.mimeTypes.xml);
    });
    describe('Generic custom objects', () => {
        let ctm = con.custom('bob/frank', elo);
        it('should not be null', () => {
            expect(ctm).not.toBeNull();
        });
        it('should be of type bob/frank', () => {
            expect(ctm.type).toBe('bob/frank');
        });
        it('should set value correctly', () => {
            expect(ctm.value).toBe(elo);
        });
        it('should have correct length', () => {
            expect(ctm.length).toBe(elo.length);
        });
    });
    describe('Check find by extension (xml)', () => {
        checkObjectInfo(con.byExtension('xml', elo), con.mimeTypes.xml);
    });
    describe('Check find by extension (js)', () => {
        checkObjectInfo(con.byExtension('js', elo), con.mimeTypes.js);
    });
    describe('Check find by extension (css)', () => {
        checkObjectInfo(con.byExtension('css', elo), con.mimeTypes.css);
    });
    describe('Check all extensions', () => {
        for (let ext in con.mimeTypes) {
            checkObjectInfo(con.byExtension(ext, elo), con.mimeTypes[ext], ext);
        }
    });
});
