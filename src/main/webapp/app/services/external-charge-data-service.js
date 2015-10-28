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
    angular.module('dashboard.services')
        .service('externalChargeDataService', ExternalChargeDataService);

    /*
        Controllers, Factories, Services, Directives
    */
    function ExternalChargeDataService() {
        var me = this;
        var formattedData = {};

        /**
         * Fires an event for the chart container to create a chart. Sends the
         * following information with the event:
         *
         * {
         *     name: <chart_name>
         *     unit: <data_unit>
         *     chartType: <chart_type>
         *     serviceType: "charge"
         * }
         *
         * @param  {Scope} $scope Scope on which the event is fired
         */
        this.notifyChartDataReady = function($scope) {
            var chartNames = [];

            for(var chartName in formattedData) {
                var chart = formattedData[chartName];

                chartNames.push({
                    name: chart.name,
                    unit: chart.unit,
                    chartType: chart.type,
                    serviceType: "charge_external"
                });
            }

            $scope.$broadcast('CHART_DATA_READY', chartNames);
        };

        /**
         * Transforms the raw response data to the following format:
         *
         * {
         *     "meter_name": {
         *         name: "meter_name",
         *         points: [...],
         *         columns: [...],
         *         enabled: true/false,
         *         type: "gauge"/"cumulative"
         *     }
         * }
         *
         * @param {Object} data Raw response data
         */
        this.setRawData = function(data) {
            if(data && data.charge) {
                var usedMeterNames = [];
                var chargeData = data.charge;
                var points = chargeData.points || [];
                var columns = chargeData.columns || [];
                var indexResource = columns.indexOf("resource");
                var indexTime = columns.indexOf("time");
                var indexPrice = columns.indexOf("price");

                for (var i = 0; i < points.length; i++) {
                    var meter = points[i];
                    var meterName = meter[indexResource];
                    var meterTime = meter[indexTime];
                    var meterPrice = meter[indexPrice];

                    /*
                        This block checks if a meter has already appeared in the
                        current data. If the meterName appears for the first time,
                        we can create the data or overwrite old data.
                     */
                    if(usedMeterNames.indexOf(meterName) == -1) {
                        formattedData[meterName] = {
                            name: meterName,
                            points: [],
                            columns: me.getFormattedColumns(),
                            enabled: true,
                            type: "gauge",
                            unit: ""
                        };

                        usedMeterNames.push(meterName);
                    }

                    formattedData[meterName].points.push([meterTime, meterPrice]);
                }
            }
        };

        /**
         * Returns the columns for the new data representation
         *
         * @return {Array}
         */
        this.getFormattedColumns = function(rawColumns) {
            var formattedColumns = ["time", "value"];
            return formattedColumns;
        };

        this.getFormattedData = function() {
            return formattedData;
        };

        this.clearData = function() {
            formattedData = {};
        };
    }

})();
