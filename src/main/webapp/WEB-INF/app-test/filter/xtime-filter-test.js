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

describe('XTimeFilter', function() {
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
        it('should print "0 ns" for incorrect value', function() {
            var res = $filter('xtime')(undefined);
            expect(res).toBe('0 ns');
        });

        it('should print "ns" for {x | 0 <= x < 1μs}', function() {
            var res = $filter('xtime')(999);
            expect(res).toBe('999 ns');
        });

        it('should print "μs" for {x | 0 <= x < 1ms}', function() {
            var res = $filter('xtime')(1000);
            expect(res).toBe('1 μs');
        });

        it('should round μs to 2 decimal places', function() {
            var res = $filter('xtime')(1000 + 10);
            expect(res).toBe('1.01 μs');
        });

        it('should print "ms" for {x | 0 <= x < 1s}', function() {
            var res = $filter('xtime')(Math.pow(1000, 2));
            expect(res).toBe('1 ms');
        });

        it('should round ms to 2 decimal places', function() {
            var res = $filter('xtime')(Math.pow(1000, 2) + 10 * Math.pow(1000, 1));
            expect(res).toBe('1.01 ms');
        });

        it('should print "s" for {x | 0 <= x < 1min}', function() {
            var res = $filter('xtime')(Math.pow(1000, 3));
            expect(res).toBe('1 s');
        });

        it('should round s to 2 decimal places', function() {
            var res = $filter('xtime')(Math.pow(1000, 3) + 10 * Math.pow(1000, 2));
            expect(res).toBe('1.01 s');
        });

        it('should print "min" for {x | 0 <= x < 1h}', function() {
            var res = $filter('xtime')(Math.pow(1000, 3) * 60);
            expect(res).toBe('1 min');
        });

        it('should round min to 2 decimal places', function() {
            var res = $filter('xtime')(Math.pow(1000, 3) * 61);
            expect(res).toBe('1.02 min');
        });

        it('should print "h" for {x | x >= 60min}', function() {
            var res = $filter('xtime')(Math.pow(1000, 3) * 60 * 60);
            expect(res).toBe('1 h');
        });

        it('should round h to 2 decimal places', function() {
            var res = $filter('xtime')(Math.pow(1000, 3) * 60 * 61);
            expect(res).toBe('1.02 h');
        });
    });
});
