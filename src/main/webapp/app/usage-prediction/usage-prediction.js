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

(function () {
    /*
     Module Setup
     */
    angular.module('dashboard.rate')
        .controller('UsagePredictionController', UsagePredictionController);

    /*
     Controllers, Factories, Services, Directives
     */
    UsagePredictionController.$inject = [
        '$scope', '$q', 'restService', 'sessionService', 'rateDataService',
        'meterselectionDataService', 'alertService', 'dateUtil'
    ];
    function UsagePredictionController($scope, $q, restService, sessionService, rateDataService,
                                       meterselectionDataService, alertService, dateUtil) {

        $scope.meters = [];
        $scope.selectedMeter = "Select Meter";
        $scope.selectedPrediction = "Select Period";
        $scope.selectedUse = "Select Period";
        var options = {1: "24 Hours", 7: "1 Week", 30: "1 Month", 90: "3 Months", 180: "6 Months"};//If we want different options for use and predict, create a new var.
        var optionStrings = {"24 Hours": 1, "1 Week": 7, "1 Month": 30, "3 Months": 90, "6 Months": 180};
        var selectedUse, selectedPrediction;
        $scope.useOptions = options;
        $scope.predictionOptions = options;

        var onLoadMeterSelectionSuccess = function (response) {
            meterselectionDataService.setRawUdrData(response.data);
            $scope.meters = meterselectionDataService.getSelectedMeterNames();
        };

        var onLoadMeterSelectionError = function (response) {
            alertService.showError("Could not load selected meters");
        };

        this.clearChartDataForUpdate = function () {
            $scope.$broadcast("CLEAR_CHARTS");
            rateDataService.clearData();
        };

        var notifyError = function (error) {
            alertService.showError(error);
        };

        /**
         * Loads the meters from UDR
         */
        this.loadMeterSelection = function () {
            restService.getUdrExternalMeters()
                .then(onLoadMeterSelectionSuccess, onLoadMeterSelectionError);
        }

        /**
         * Sets the $scope variable to the selected meter so we can represent it in the Dropdown Menu
         * and requests the predictions to the restService with all the params
         * @param meter
         */
        $scope.dropdownMeterSelected = function (meter) {
            if (selectedPrediction && selectedUse) {
                $scope.selectedMeter = meter;

                var keystoneId = sessionService.getKeystoneId();
                var exIds = restService.getExternalUserIds(keystoneId);

                for (var i = 0; i < exIds.length; i++) {
                    var exId = exIds[i];

                    if (exId.userId && exId.userId != "") {
                        restService.getPredictions(exId.userId, selectedUse, selectedPrediction, meter);
                    }
                }

                restService.getPredictions(keystoneId, selectedUse, selectedPrediction, meter)
                    .then(drawPredictionChart);
            } else {
                notifyError("Select the Periods to predict.");
            }
        }

        /**
         * Sets the $scope variable to the selected use so we can represent it in the Dropdown Menu
         * @param meter
         */
        $scope.dropdownUseSelected = function (use) {
            $scope.selectedUse = use;
            selectedUse = optionStrings[use];
        }

        /**
         * Sets the $scope variable to the selected prediction so we can represent it in the Dropdown Menu
         * @param meter
         */
        $scope.dropdownPredictionSelected = function (prediction) {
            $scope.selectedPrediction = prediction;
            selectedPrediction = optionStrings[prediction];
        }

        this.loadMeterSelection();

    };

})();
