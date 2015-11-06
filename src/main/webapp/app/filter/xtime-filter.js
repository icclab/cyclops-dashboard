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

(function() {

    angular.module('dashboard.filter')
        .filter('xtime', XTimeFilter);

    function XTimeFilter() {

        /**
         * Converts ns into ms / s / min / hours.
         *
         * @param  {int} ns Amount in ns to transform
         * @return {String}     Human readable string
         */
        return function(ns) {
            ns = ns || 0;
            var base = 1000;
            var oneSecond = Math.pow(base, 3);
            var lowUnits = ["μs", "ms", "s"];

            //For values lower than 1 microsecond, no need to calculate anything
            if(ns < base) {
                return ns + " ns";
            }

            //Do the calculations for all units that can be divided by 1000
            if(ns < oneSecond) {
                var exp = Math.floor(Math.log(ns) / Math.log(base));
                var pre = lowUnits[exp-1];
                var roundedValue = Math.round((ns / Math.pow(base, exp)) * 100) / 100;
                return roundedValue + " " + pre;
            }

            //If the code gets to this point, we have a unit >= seconds that
            //needs special treatment
            var totalSeconds = ns / oneSecond;
            var hours   = Math.floor(totalSeconds / 3600);
            var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
            var seconds = totalSeconds - (hours * 3600) - (minutes * 60);

            if(hours >= 1) {
                var decimalMinutes = Math.round((minutes / 60) * 100) / 100;
                return (hours + decimalMinutes) + " h";
            }
            else if(minutes >= 1) {
                var decimalSeconds = Math.round((seconds / 60) * 100) / 100;
                return (minutes + decimalSeconds) + " min";
            }

            return seconds + " s";
        };
    }

})();
