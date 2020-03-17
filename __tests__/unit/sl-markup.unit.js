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

const slMarkup = require('../../lib/sl-markup');
const utilz = new (require('../../lib/sl-utils'))();
const stringUtilz = require('string-utilz');

const om = require('output-manager');
const out = new om.Out();

const testHtmlRoot = '__test/webapp/html';
const testTemplateRoot = testHtmlRoot + '/_partials';

const markup = new slMarkup(utilz, {}, testTemplateRoot);

const variableTemplatePre =
    '<!DOCTYPE html><html lang="en-US"><head><meta charset="UTF-8" /><title>'
const variableTemplatePost = '</title></head><body><h1>Hello Markup</h1></body></html>';

const variableTemplate = variableTemplatePre + '%{title}' + variableTemplatePost;
const variableResult = (value) => { return variableTemplatePre + value + variableTemplatePost; }

describe('sl-markup (Unit)', () => {
    describe('check getters setters', () => {
        it('should get defaultvalues', () => {
            expect(markup.defaultValues).toMatchObject({});
        });
        it('should set defaultvalues', () => {
            let vals = { foo: 'foo' }
            markup.defaultValues = vals;
            expect(markup.defaultValues).toMatchObject(vals);
        });
        it('should get template root', () => {
            expect(markup.templateRoot).toBe(testTemplateRoot);
        });
        it('should set defaultvalues', () => {
            markup.templateRoot = 'foo';
            expect(markup.templateRoot).toBe('foo');
            markup.templateRoot = testTemplateRoot;
            expect(markup.templateRoot).toBe(testTemplateRoot);
        });
    });
    describe('override template values', () => {
        let tmpMarkup = new slMarkup(utilz, { foo: 'foo', bar: 'bar' });
        it('returns the correct default object', () => {
            let res = tmpMarkup.buildVarsFromDefaults();
            expect(res.foo).toBe('foo');
            expect(res.bar).toBe('bar');
        });
        it('adds a value correctly', () => {
            let res = tmpMarkup.buildVarsFromDefaults({ foobar: 'foobar' });
            expect(res.foo).toBe('foo');
            expect(res.bar).toBe('bar');
            expect(res.foobar).toBe('foobar');
        });
        it('overrides a value correctly', () => {
            let res = tmpMarkup.buildVarsFromDefaults({ foo: 'bar', foobar: 'foobar' });
            expect(res.foo).toBe('bar');
            expect(res.bar).toBe('bar');
            expect(res.foobar).toBe('foobar');
        });
    });
    describe('variable replacement', () => {
        it('can replace a basic variable', () => {
            let tmpTitle = 'Hello Markup';
            let result = markup.buildFromTemplate(variableTemplate, { title: tmpTitle });
            expect(result).not.toBeNull();
            expect(result).toBe(variableResult(tmpTitle));
        });
        it('replaces the same variable twice', () => {
            let tmpTitle = 'Hello Markup';
            let result = markup.buildFromTemplate(variableTemplate + '%{title}', { title: tmpTitle });
            expect(result).not.toBeNull();
            expect(result).toBe(variableResult(tmpTitle) + tmpTitle);
        });
        it('replaces multiple variables', () => {
            let tmpTitle = 'Hello Markup';
            let result = markup.buildFromTemplate(variableTemplate + '%{title}-%{foo}-%{bar}', { title: tmpTitle, foo: 'foo', bar: 'bar' });
            expect(result).not.toBeNull();
            expect(result).toBe(variableResult(tmpTitle) + tmpTitle + '-foo-bar');
        });
    });
    describe('partial inclusion', () => {
        const partialMarkup = new slMarkup(utilz, { title: 'My Cool Title' }, testTemplateRoot);
        let output = '';
        it('can load and process a partial', (done) => {
            expect(partialMarkup).not.toBeNull();
            let awaitCache = () => {
                if (partialMarkup.cacheLoaded()) {
                    expect(Object.keys(partialMarkup.templateCache).length).not.toBe(0);
                    output = partialMarkup.buildFromFileWithPartials(testHtmlRoot + '/markup-index.html');
                    expect(output).not.toBeNull();
                    expect(output.length > 0).toBeTruthy();

                    done();
                }
                else { out.t('waiting...'); setTimeout(awaitCache, 50); }
            }
            awaitCache();
        });

        it('starts with DOCTYPE', () => { expect(stringUtilz.startsWith(output, '<!DOCTYPE html>')).toBeTruthy(); });

        it('ends with an html close', () => { expect(stringUtilz.endsWith(output, '</html>')).toBeTruthy(); });

        it('has the correct title', () => { expect(stringUtilz.containsIgnoreCase(output, '<title>My Cool Title</title>')).toBeTruthy(); });

        it('has the correct body', () => { expect(stringUtilz.containsIgnoreCase(output, '<h1>Hello Markup</h1>')).toBeTruthy(); });

    });
});
