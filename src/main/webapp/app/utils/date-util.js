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
    /*
        Module Setup
    */
    angular.module('dashboard.utils')
        .service('dateUtil', DateUtil);

    /*
        Controllers, Factories, Services, Directives
    */
    function DateUtil() {
        var me = this;

        this.formatDate = function(dateObject) {
            return dateObject.toString("yyyy-MM-dd");
        };

        this.formatDateFromTimestamp = function(timestamp) {
            return new Date(timestamp).toString("yyyy-MM-dd");
        };

        this.formatTime = function(dateObject) {
            return dateObject.toString("HH:mm");
        };

        this.formatTimeFromTimestamp = function(timestamp) {
            return new Date(timestamp).toString("HH:mm");
        };

        this.formatDateTime = function(dateObject) {
            return dateObject.toString("yyyy-MM-dd HH:mm")
        };

        this.formatDateTimeFromTimestamp = function(timestamp) {
            return new Date(timestamp).toString("yyyy-MM-dd HH:mm")
        };

        this.getTimestamp = function() {
            return new Date().getTime();
        };

        this.getFormattedTimeNow = function() {
            return me.formatTime(Date.now());
        };

        this.getFormattedDateTimeNow = function() {
            return me.formatDateTimeFromTimestamp(Date.now());
        };

        this.getFormattedDateToday = function() {
            return me.formatDate(Date.today());
        };

        this.getFormattedDateYesterday = function() {
            return me.formatDate(Date.today().addDays(-1));
        };

        this.addDaysToDateString = function(dateString, days) {
            return me.formatDate(new Date(dateString).addDays(days));
        };

        this.compareDateStrings = function(dateStringA, dateStringB) {
            var a = new Date(dateStringA);
            var b = new Date(dateStringB);

            if(a > b) return -1;
            if(a < b) return 1;
            return 0;
        };
    }

})();
