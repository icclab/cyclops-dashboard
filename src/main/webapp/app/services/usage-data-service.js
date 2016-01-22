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
    angular.module('dashboard.services')
        .service('usageDataService', UsageDataService);

    /*
     Controllers, Factories, Services, Directives
     */
    function UsageDataService() {
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
         *     serviceType: "usage"
         * }
         *
         * @param  {Scope} $scope Scope on which the event is fired
         */
        this.notifyChartDataReady = function ($scope) {
            var chartNames = [];

            for (var chartName in formattedData) {
                var chart = formattedData[chartName];

                chartNames.push({
                    name: chart.name,
                    unit: chart.unit,
                    chartType: chart.type,
                    serviceType: "usage"
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
        this.setRawData = function (data) {
            if (data && data.usage) {
                if (data.usage.OpenStack)  //TODO: In case we are having OpenStack Data. (Manu: Senseless, same representation for all?)
                    this.representOpenstack(data);
                else //TODO: Test, this will represent as if it was external.
                    this.representExternal(data);

            } else {
                this.represent(data);
            }
        };

        /**
         * This method will represent a simple json format which contains objects with at least the following 3 fields:
         * {
         *  ...
         *  "time": yyyy-MM-dd hh:mm:ss
         *  "usage": n
         *  "productType/meter": "metername"
         *  ...
         * }
         * @param data
         */
        this.represent = function(data){
            if(data.usages){
                usagesArray = data.usages;
                for(var i = 0; i< usagesArray.length; i++){
                    formattedPoint[usagesArray[i].productType] = {
                        name: usagesArray[i].productType,
                        time: usagesArray[i].time,
                        usage: usagesArray[i].usage,
                        type: "gauge" //TODO: We set the meter type as gauge at the moment
                    }
                }
            }
        }


        /**
         * This method will represent the json data that comes in the old json format with "Openstack" header
         *
         * @param data
         */
        this.representOpenstack = function (data) {
            dataArray = data.usage.OpenStack;

            for (var i = 0; i < dataArray.length; i++) {
                currentData = dataArray[i];

                //Skip if data is null (no usage data available)
                if (!currentData) {
                    continue;
                }

                //Get the first point to find out the meter type and unit
                var firstPoint = currentData.points[0] || [];
                var indexType = currentData.columns.indexOf("type");
                var indexUnit = currentData.columns.indexOf("unit");
                var type = firstPoint[indexType];
                var unit = firstPoint[indexUnit];

                var formattedColumns = me.getFormattedColumns();
                var formattedPoints = me.formatPoints(
                    currentData.points,
                    currentData.columns
                );

                formattedData[currentData.name] = {
                    name: currentData.name,
                    columns: formattedColumns,
                    points: formattedPoints,
                    enabled: true,
                    type: type,
                    unit: unit
                };
            }
        }

        /**
         * This method will represent the json data that comes in the old json format with different header than "Openstack"
         * repeated method from external-usage-data-service.js
         * @param data
         */
        this.representExternal = function (data) {
            dataArray = data.usage.External;

            for (var i = 0; i < dataArray.length; i++) {
                currentData = dataArray[i];

                //Skip if data is null (no usage data available)
                if (!currentData) {
                    continue;
                }

                //Get the first point to find out the meter type and unit
                var firstPoint = currentData.points[0] || [];

                var formattedColumns = me.getFormattedColumns();
                var formattedPoints = me.formatPoints(
                    currentData.points,
                    currentData.columns
                );

                formattedData[currentData.name] = {
                    name: currentData.name,
                    columns: formattedColumns,
                    points: formattedPoints,
                    enabled: true,
                    type: "gauge",
                    unit: ""
                };
            }
        }

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
        this.formatPoints = function (rawPoints, rawColumns) {
            var formattedPoints = [];
            var indexTime = rawColumns.indexOf("time");
            var indexAvg = rawColumns.indexOf("avg");
            var indexUsage = rawColumns.indexOf("usage");

            for (var i = 0; i < rawPoints.length; i++) {
                var rawPoint = rawPoints[i];
                var time = rawPoint[indexTime];
                var value = 0;

                if (indexAvg > -1) {
                    value = rawPoint[indexAvg];
                }
                else if (indexUsage > -1) {
                    value = rawPoint[indexUsage];
                }

                formattedPoints.push([time, value]);
            }
            ;

            return formattedPoints;
        };

        /**
         * Returns the columns for the new data representation
         *
         * @return {Array}
         */
        this.getFormattedColumns = function (rawColumns) {
            var formattedColumns = ["time", "value"];
            return formattedColumns;
        };

        this.getFormattedData = function () {
            return formattedData;
        };

        this.clearData = function () {
            formattedData = {};
        };
    }

})();
