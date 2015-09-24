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
    angular.module('dashboard.rate')
        .controller('RateController', RateController);

    /*
        Controllers, Factories, Services, Directives
    */
    RateController.$inject = [
        '$scope', '$q', 'restService', 'sessionService', 'rateDataService',
        'meterselectionDataService', 'alertService', 'dateUtil'
    ];
    function RateController(
            $scope, $q, restService, sessionService, rateDataService,
            meterselectionDataService, alertService, dateUtil) {
        var me = this;
        this.dateFormat = "yyyy-MM-dd";
        this.defaultDate = dateUtil.getFormattedDateToday();

        var onLoadRateDataSuccess = function(responses) {
            me.clearChartDataForUpdate();

            for (var i = 0; i < responses.length; i++) {
                var response = responses[i];
                rateDataService.setRawData(response.data);
            };

            rateDataService.notifyChartDataReady($scope);
        };

        var onLoadRateDataFailed = function(reponse) {
            alertService.showError("Requesting rate data failed");
        };

        var onLoadMeterSelectionSuccess = function(response) {
            meterselectionDataService.setRawUdrData(response.data);
            var meters = meterselectionDataService.getSelectedMeterNames();

            me.requestRatesForMeters(
                meters,
                dateUtil.getFormattedDateToday() + " 00:00",
                dateUtil.getFormattedDateToday() + " 23:59"
            );
        };

        var onLoadMeterSelectionError = function(response) {
            alertService.showError("Could not load selected meters");
        };

        this.clearChartDataForUpdate = function() {
            $scope.$broadcast("CLEAR_CHARTS");
            rateDataService.clearData();
        };

        //https://docs.angularjs.org/guide/directive#creating-a-directive-that-wraps-other-elements
        this.onDateChanged = function(from, to) {
            var fromDate = dateUtil.formatDateFromTimestamp(from) + " 00:00";
            var toDate = dateUtil.formatDateFromTimestamp(to) + " 23:59";
            var meters = meterselectionDataService.getSelectedMeterNames();
            me.requestRatesForMeters(meters, fromDate, toDate);
        };

        this.requestRatesForMeters = function(meterNames, from, to) {
            var promises = [];

            for (var i = 0; i < meterNames.length; i++) {
                var promise = restService.getRateForMeter(meterNames[i], from, to);
                promises.push(promise);
            }

            $q.all(promises).then(onLoadRateDataSuccess, onLoadRateDataFailed);
        };

        this.loadMeterSelection = function() {
            restService.getUdrMeters()
                .then(onLoadMeterSelectionSuccess, onLoadMeterSelectionError);
        }

        this.loadMeterSelection();
    };

})();
