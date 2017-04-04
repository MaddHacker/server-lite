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

const config = require('../../lib/sl-config');

describe('sl-config (Unit)', function () {
    describe('default functionality', function () {
        it('can create a default object', function () {
            expect(new config()).not.toBe(null);
        });
        it('uses the default output-manager', function () {
            let tmpCfg = new config();
            expect(tmpCfg.out).not.toBe(null);
            expect(tmpCfg.out instanceof require('output-manager').Out).toBe(true);
        });
        it('uses the default https options', function () {
            expect(JSON.stringify(new config().httpsOptions)).toBe(JSON.stringify({}));
        });
        it('uses the default port', function () {
            expect(new config().listenOptions.port).toBe(5000);
        });
        it('does not set a host', function () {
            expect(new config().listenOptions.host).toBe(undefined);
        });
        it('does not set a backlog', function () {
            expect(new config().listenOptions.backlog).toBe(undefined);
        });
        it('does not set a path', function () {
            expect(new config().listenOptions.path).toBe(undefined);
        });
        it('does not set exclusive', function () {
            expect(new config().listenOptions.exclusive).toBe(undefined);
        });
    });
    describe('custom functionality', function () {
        it('uses the given output-manager', function () {
            let tmpOut = new (require('output-manager')).Out();
            expect(new config({ out: tmpOut }).out).toBe(tmpOut);
        });
        it('uses the given https options', function () {
            expect(JSON.stringify(new config({ httpsOpts: { key: 'bob', cert: 'frank' } }).httpsOptions)).toBe(JSON.stringify({ key: 'bob', cert: 'frank' }));
        });
        it('uses the given port', function () {
            expect(new config({ port: 1234 }).listenOptions.port).toBe(1234);
        });
        it('sets a host when provided', function () {
            expect(new config({ host: 'myurl.com' }).listenOptions.host).toBe('myurl.com');
        });
        it('sets a backlog when provided', function () {
            expect(new config({ backlog: 5000 }).listenOptions.backlog).toBe(5000);
        });
        it('sets a path when provided', function () {
            expect(new config({ path: 'path/to/socket' }).listenOptions.path).toBe('path/to/socket');
        });
        it('sets exclusive when provided', function () {
            expect(new config({ exclusive: true }).listenOptions.exclusive).toBe(true);
        });
    });
});
