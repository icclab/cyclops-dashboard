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
        .service('rateDataService', RateDataService);

    /*
        Controllers, Factories, Services, Directives
    */
    function RateDataService() {
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
         *     serviceType: "rate"
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
                    serviceType: "rate"
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
         * The 'points' array will follow the order of the 'columns'
         *
         * @param {Object} data Raw response data
         */
        this.setRawData = function(data) {
            if(data && data.rate) {
                var rateData = data.rate;

                for (var meterName in rateData) {
                    dataArray = data.rate[meterName];
                    formattedData[meterName] = {};
                    formattedData[meterName]["name"] = meterName;
                    formattedData[meterName]["columns"] = me.getFormattedColumns();
                    formattedData[meterName]["points"] = me.formatPoints(dataArray);
                    formattedData[meterName]["enabled"] = true;
                    formattedData[meterName]["type"] = "gauge";
                    formattedData[meterName]["unit"] = "";
                }
            }
        };

        /**
         * Transforms the raw points to the following format:
         *
         * [
         *     <timestamp>
         *     <point_value>
         * ]
         *
         * @param {Object} rawPoints Raw point data
         * @param {Object} rawColumns Raw column data
         * @return {Array}
         */
        this.formatPoints = function(rawPoints, rawColumns) {
            var formattedPoints = [];

            for(var i = 0; i < rawPoints.length; i++) {
                var rawPoint = rawPoints[i];
                formattedPoints.push([rawPoint[0], rawPoint[2]]);
            }

            return formattedPoints;
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
