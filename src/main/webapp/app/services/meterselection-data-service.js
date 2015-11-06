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
        .service('meterselectionDataService', MeterselectionDataService);

    /*
        Controllers, Factories, Services, Directives
    */
    function MeterselectionDataService() {
        var me = this;
        var formattedUdrData = {};
        var formattedOpenstackData = {};

        /**
         * Transforms the raw UDR response data to the following format:
         *
         * {
         *     "meter_name": {
         *         name: "meter_name",
         *         enabled: true/false,
         *         type: "gauge"/"cumulative",
         *         source: "meter_source"
         *     }
         * }
         *
         * @param {Object} data Raw response data
         */
        this.setRawUdrData = function(data) {
            formattedUdrData = {};
            var meters = data.points || [];
            var columns = data.columns || [];
            var indexName = columns.indexOf("metername");
            var indexType = columns.indexOf("metertype");
            var indexSource = columns.indexOf("metersource");
            var indexStatus = columns.indexOf("status");

            for (var i = 0; i < meters.length; i++) {
                var meter = meters[i];
                var meterName = meter[indexName];

                formattedUdrData[meterName] = {
                    name: meterName,
                    enabled: meter[indexStatus] == 1,
                    type: meter[indexType],
                    source: meter[indexSource]
                };
            };
        };

        /**
         * Transforms the raw OpenStack response data to the following format:
         *
         * {
         *     "meter_name": {
         *         name: "meter_name",
         *         enabled: false,
         *         type: "gauge"/"cumulative",
         *         source: "meter_source"
         *     }
         * }
         *
         * @param {Object} data Raw response data
         */
        this.setRawOpenstackData = function(data) {
            formattedOpenstackData = {};

            for(var i = 0; i < data.length; i++) {
                var meter = data[i];
                var meterName = meter.name;

                formattedOpenstackData[meterName] = {
                    name: meterName,
                    enabled: false,
                    type: meter.type,
                    source: meter.source
                };
            }
        };

        this.getFormattedUdrData = function() {
            return formattedUdrData;
        };

        this.getFormattedOpenstackData = function() {
            return formattedOpenstackData;
        };

        this.getSelectedMeterNames = function() {
            var selectedMeterNames = [];

            for(var meterName in formattedUdrData) {
                if(formattedUdrData[meterName].enabled) {
                    selectedMeterNames.push(meterName);
                }
            }

            return selectedMeterNames;
        };
    }

})();
