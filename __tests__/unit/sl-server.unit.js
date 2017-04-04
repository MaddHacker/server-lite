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

const svr = require('../../lib/sl-server');

class MockSvr {
    constructor() {
        this.actions = {};
        this.listenOpts = null;
        this.listenFxn = null;
        this.closeCalled = false;
    }

    on(action, fxn) {
        this.actions[action] = fxn;
        return this;
    }
    listen(opts, fxn) {
        this.listenOpts = opts;
        this.listenFxn = fxn;
        return this;
    }
    close() {
        this.closeCalled = true;
    }
}

describe('sl-server (Unit)', function () {
    describe('Check slServer', function () {
        let tmpSvr = new svr.slServer();
        it('should use default slConfig', function () {
            expect(tmpSvr._config).not.toBe(null);
            expect(tmpSvr._config.listenOptions.port).toBe(5000);
        });
        it('should have the server object set to null', function () {
            expect(tmpSvr.server).toBe(null);
        });

        let mySvr = new MockSvr();
        it('should have a MockSvr', function () {
            expect(JSON.stringify(mySvr.actions)).toBe(JSON.stringify({}));
            expect(mySvr.listenOpts).toBe(null);
            expect(mySvr.listenFxn).toBe(null);
            expect(mySvr.closeCalled).toBe(false);
        });

        it('should set server object when started', function () {
            tmpSvr._start(mySvr);
            expect(tmpSvr.server).not.toBe(null);
            expect(tmpSvr.server instanceof MockSvr).toBe(true);
        });
        it('should not set closeCalled', function () {
            expect(mySvr.closeCalled).toBe(false);
        });
        it('should setup all mock actions (and they should be Functions)', function () {
            expect(mySvr.actions.checkContinue).not.toBe(null);
            expect(mySvr.actions.checkContinue instanceof Function).toBe(true);
            expect(mySvr.actions.checkExpectation).not.toBe(null);
            expect(mySvr.actions.checkExpectation instanceof Function).toBe(true);
            expect(mySvr.actions.clientError).not.toBe(null);
            expect(mySvr.actions.clientError instanceof Function).toBe(true);
            expect(mySvr.actions.close).not.toBe(null);
            expect(mySvr.actions.close instanceof Function).toBe(true);
            expect(mySvr.actions.connect).not.toBe(null);
            expect(mySvr.actions.connect instanceof Function).toBe(true);
            expect(mySvr.actions.connection).not.toBe(null);
            expect(mySvr.actions.connection instanceof Function).toBe(true);
            expect(mySvr.actions.error).not.toBe(null);
            expect(mySvr.actions.error instanceof Function).toBe(true);
            expect(mySvr.actions.upgrade).not.toBe(null);
            expect(mySvr.actions.upgrade instanceof Function).toBe(true);
        });
        it('should have set the listenFxn (and it should be a Function)', function () {
            expect(mySvr.listenFxn).not.toBe(null);
            expect(mySvr.listenFxn instanceof Function).toBe(true);
        });
        it('should have set the listenOpts', function () {
            expect(mySvr.listenOpts).not.toBe(null);
        });
        it('should be using port 5000', function () {
            expect(mySvr.listenOpts.port).toBe(5000);
        });
        it('should set closeCalled when close is called', function () {
            tmpSvr.stop();
            expect(mySvr.closeCalled).toBe(true);
        });
    });
    describe('Check slHttpServer', function () {
        it('should be an instanceof slServer', function () {
            expect((new svr.slHttp()) instanceof svr.slServer).toBe(true);
        });
        let tmpSvr = new svr.slHttp();
        it('should use default slConfig', function () {
            expect(tmpSvr._config).not.toBe(null);
            expect(tmpSvr._config.listenOptions.port).toBe(5000);
        });
        it('should have the server object set to null', function () {
            expect(tmpSvr.server).toBe(null);
        });
    });
    describe('Check slHttpsServer', function () {
        it('should be an instanceof slServer', function () {
            expect((new svr.slHttps()) instanceof svr.slServer).toBe(true);
        });
        let tmpSvr = new svr.slHttps();
        it('should use default slConfig', function () {
            expect(tmpSvr._config).not.toBe(null);
            expect(tmpSvr._config.listenOptions.port).toBe(5000);
        });
        it('should have the server object set to null', function () {
            expect(tmpSvr.server).toBe(null);
        });
    });
});
