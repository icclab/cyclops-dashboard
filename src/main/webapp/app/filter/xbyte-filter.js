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
        .filter('xbytes', XBytesFilter);

    function XBytesFilter() {

        /**
         * Converts bytes into kilo / mega / giga / ... bytes. The method
         * can handle SI-units (k = 1000) or binary units (k = 1024).
         *
         * Source: http://stackoverflow.com/a/3758880
         *
         * @param  {int} bytes Amount in bytes to transform
         * @param  {boolean} si    Use SI units
         * @return {String}     Human readable string
         */
        return function(bytes, si) {
            var unit = si ? 1000 : 1024;

            if (bytes < unit) {
                return bytes + " B";
            }

            var exp = Math.floor(Math.log(bytes) / Math.log(unit));
            var pre = (si ? "kMGTPE" : "KMGTPE").charAt(exp-1) + (si ? "" : "i");
            var roundedValue = Math.round((bytes / Math.pow(unit, exp)) * 100) / 100;

            return (roundedValue || 0) + " " + pre + "B";
        };
    }

})();
