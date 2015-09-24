/*
 * Copyright (c) 2015. Zuercher Hochschule fuer Angewandte Wissenschaften
 *  All Rights Reserved.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License"); you may
 *     not use this file except in compliance with the License. You may obtain
 *     a copy of the License at
 *
 *          http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 *     WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 *     License for the specific language governing permissions and limitations
 *     under the License.
 */

describe('XByteFilter', function() {
  var $filter;

    /*
        Test setup
     */
    beforeEach(function() {
        resetAllMocks();

        /*
            Load module
         */
        module('dashboard.filter');

        /*
            Inject dependencies and configure mocks
         */
        inject(function(_$filter_) {
            $filter = _$filter_;
        });
    });

    /*
        Tests
     */
    describe('for SI-Units', function() {
        it('should print "0 kB" for invalid input', function() {
            var res = $filter('xbytes')(undefined, true);
            expect(res).toBe('0 kB');
        });

        it('should print "B" for {x | 0 <= x < 1kB}', function() {
            var res = $filter('xbytes')(999, true);
            expect(res).toBe('999 B');
        });

        it('should print "kB" for {x | 1kB <= x < 1MB}', function() {
            var res = $filter('xbytes')(1000, true);
            expect(res).toBe('1 kB');
        });

        it('should print "MB" for {x | 1MB <= x < 1GB}', function() {
            var res = $filter('xbytes')(Math.pow(1000, 2), true);
            expect(res).toBe('1 MB');
        });

        it('should print "GB" for {x | 1GB <= x < 1TB}', function() {
            var res = $filter('xbytes')(Math.pow(1000, 3), true);
            expect(res).toBe('1 GB');
        });

        it('should print "TB" for {x | 1TB <= x < 1PB}', function() {
            var res = $filter('xbytes')(Math.pow(1000, 4), true);
            expect(res).toBe('1 TB');
        });

        it('should print "PB" for {x | 1PB <= x < 1EB}', function() {
            var res = $filter('xbytes')(Math.pow(1000, 5), true);
            expect(res).toBe('1 PB');
        });

        it('should print "EB" for {x | 1EB <= x}', function() {
            var res = $filter('xbytes')(Math.pow(1000, 6), true);
            expect(res).toBe('1 EB');
        });
    });

    describe('for Binary Units', function() {
        it('should print "0 KiB" for invalid input', function() {
            var res = $filter('xbytes')(undefined, false);
            expect(res).toBe('0 KiB');
        });

        it('should print "B" for {x | 0 <= x < 1KiB}', function() {
            var res = $filter('xbytes')(1023, false);
            expect(res).toBe('1023 B');
        });

        it('should print "KiB" for {x | 1KiB <= x < 1MiB}', function() {
            var res = $filter('xbytes')(1024, false);
            expect(res).toBe('1 KiB');
        });

        it('should print "MiB" for {x | 1MiB <= x < 1GiB}', function() {
            var res = $filter('xbytes')(Math.pow(1024, 2), false);
            expect(res).toBe('1 MiB');
        });

        it('should print "GiB" for {x | 1GiB <= x < 1TiB}', function() {
            var res = $filter('xbytes')(Math.pow(1024, 3), false);
            expect(res).toBe('1 GiB');
        });

        it('should print "TiB" for {x | 1TiB <= x < 1PiB}', function() {
            var res = $filter('xbytes')(Math.pow(1024, 4), false);
            expect(res).toBe('1 TiB');
        });

        it('should print "PiB" for {x | 1PiB <= x < 1EiB}', function() {
            var res = $filter('xbytes')(Math.pow(1024, 5), false);
            expect(res).toBe('1 PiB');
        });

        it('should print "EiB" for {x | 1EiB <= x}', function() {
            var res = $filter('xbytes')(Math.pow(1024, 6), false);
            expect(res).toBe('1 EiB');
        });
    });
});
