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
        .service('chartDataService', ChartDataService);

    /*
        Controllers, Factories, Services, Directives
    */
    ChartDataService.$inject = [
        'usageDataService', 'rateDataService', 'chargeDataService',
        'externalUsageDataService', 'externalChargeDataService'
    ];
    function ChartDataService(usageDataService, rateDataService, chargeDataService,
            externalUsageDataService, externalChargeDataService) {
        var me = this;

        this.getServiceDelegate = function(type) {
            if(type == "usage") {
                return usageDataService;
            }
            else if(type == "rate") {
                return rateDataService;
            }
            else if(type == "charge") {
                return chargeDataService;
            }
            else if(type == "usage_external") {
                return externalUsageDataService;
            }
            else if(type == "charge_external") {
                return externalChargeDataService;
            }
        };

        this.doSampling = function(points, maxNum) {
            var sampledPoints = [];
            var numPoints = points.length;
            var modulus = Math.round(numPoints / maxNum) || 1;

            if(numPoints < maxNum) {
                return points;
            }

            for(var i = 0; i < numPoints; i++) {
                if(i % modulus == 0) {
                    sampledPoints.push(points[i]);
                }
            }

            return sampledPoints;
        };

        this.getCumulativeMeterData = function(type, meterName) {
            try {
                /*
                    Cumulative meters can be treated as gauge meters, because
                    the raw data is represented in the same way (many individual
                    data points). We need to sum up the individual points to
                    get the cumulative result.
                 */
                var gaugeData = me.getGaugeMeterData(type, meterName);
                var cumulativeValue = 0;

                for(var i = 0; i < gaugeData.length; i++) {
                    cumulativeValue += gaugeData[i].y;
                }

                return cumulativeValue;
            }
            catch(err) {
                return 0;
            }
        };

        this.getGaugeMeterData = function(type, meterName) {
            try {
                var service = me.getServiceDelegate(type);
                var serviceData = service.getFormattedData();
                var dataPoints = serviceData[meterName].points || [];
                dataPoints.reverse();
                var numPoints = dataPoints.length;
                var data = [];

                for(var i = 0; i < numPoints; i++) {
                    data.push({x: dataPoints[i][0], y: dataPoints[i][1]});
                }

                return data;
            }
            catch(err) {
                return [];
            }
        };

        this.getSampledGaugeMeterData = function(type, meterName) {
            var unsampledPoints = me.getGaugeMeterData(type, meterName);
            var sampledData = me.doSampling(unsampledPoints, 100);
            return sampledData;
        };
    }

})();
