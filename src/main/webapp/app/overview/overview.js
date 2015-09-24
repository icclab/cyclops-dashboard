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

(function(){
    /*
        Module Setup
    */
    angular.module('dashboard.overview')
        .controller('OverviewController', OverviewController);

    /*
        Controllers, Factories, Services, Directives
    */
    OverviewController.$inject = [
        '$scope', '$location',
        'restService', 'sessionService', 'usageDataService', 'externalUsageDataService',
        'alertService', 'dateUtil'
    ];
    function OverviewController(
            $scope, $location,
            restService, sessionService, usageDataService, externalUsageDataService,
            alertService, dateUtil) {

        var me = this;
        this.dateFormat = "yyyy-MM-dd";
        this.defaultDate = dateUtil.getFormattedDateToday();
        this.externalUserIds = [];

        var loadUdrDataSuccess = function(response) {
            usageDataService.setRawData(response.data);
            usageDataService.notifyChartDataReady($scope);
        };

        var loadUdrDataFailed = function(response) {
            alertService.showError("Requesting meter data failed");
        };

        var loadExternalDataSuccess = function(response) {
            externalUsageDataService.setRawData(response.data);
            externalUsageDataService.notifyChartDataReady($scope);
        };

        var loadExternalDataError = function(response) {
            alertService.showError("Requesting external meter data failed");
        };

        var onLoadIdsSuccess = function (response) {
            var dateToday = dateUtil.getFormattedDateToday();
            me.externalUserIds = response.data;
            me.onDateChanged(dateToday, dateToday);
        };

        var onLoadIdsError = function() {
            var dateToday = dateUtil.getFormattedDateToday();
            me.externalUserIds = [];
            me.onDateChanged(dateToday, dateToday);
        };

        this.requestUsage = function(keystoneId, from, to) {
            restService.getUdrData(keystoneId, from, to)
                .then(loadUdrDataSuccess, loadUdrDataFailed);
        };

        this.requestExternalUsage = function(externalUserId, from, to) {
            restService.getUdrData(externalUserId, from, to)
                .then(loadExternalDataSuccess, loadExternalDataError);
        };

        this.hasKeystoneId = function() {
            var id = sessionService.getKeystoneId();
            return id && id.length > 0 && id != "0";
        };

        this.showCloudServices = function() {
            $location.path("/cloudservices");
        };

        this.clearChartDataForUpdate = function() {
            $scope.$broadcast("CLEAR_CHARTS");
            usageDataService.clearData();
            externalUsageDataService.clearData();
        };

        //https://docs.angularjs.org/guide/directive#creating-a-directive-that-wraps-other-elements
        this.onDateChanged = function(from, to) {
            var date = new Date();
            var minutes = date.getMinutes();
            var hours = date.getHours();
            //hours = hours-2;
            if(minutes<10)
                var toDate = dateUtil.formatDateFromTimestamp(to) + " "+hours +":0"+date.getMinutes();
            else
                var toDate = dateUtil.formatDateFromTimestamp(to) + " "+hours +":"+date.getMinutes();
            var fromDate = dateUtil.formatDateFromTimestamp(from) + " 00:00";
            me.updateCharts(fromDate, toDate);
        };

        this.updateCharts = function(from, to) {
            if(me.hasKeystoneId()) {
                var keystoneId = sessionService.getKeystoneId();
                var exIds = me.externalUserIds;

                me.clearChartDataForUpdate();

                for(var i = 0; i < exIds.length; i++) {
                    var exId = exIds[i];

                    if(exId.userId && exId.userId != "") {
                        me.requestExternalUsage(exId.userId, from, to);
                    }
                }

                me.requestUsage(keystoneId, from, to);
            }
        };

        this.loadExternalUserIds = function() {
            var keystoneId = sessionService.getKeystoneId();
            restService.getExternalUserIds(keystoneId)
                .then(onLoadIdsSuccess, onLoadIdsError);
        };

        this.loadExternalUserIds();
    };

})();
