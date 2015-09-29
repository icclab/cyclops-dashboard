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
        .service('billDataService', BillDataService);

    /*
        Controllers, Factories, Services, Directives
    */
    function BillDataService() {
        var me = this;
        var formattedData = {};

        /**
         * Transforms the raw response data to the following format:
         * {
         *     "meter_name1": {
         *         resource: "resource_name",
         *         unit: "resource_unit",
         *         usage: <resource_usage>,
         *         rate: <resource_rate>,
         *         price: <resource_charge>,
         *         discount: <resource_discount>
         *     },
         *     "meter_name2": {...}
         * }
         *
         *
         * @param {Object} data Raw response data
         */
        this.setRawData = function(data) {
            if(data && data.charge) {
                var chargeData = data.charge;
                var points = chargeData.points || [];
                var columns = chargeData.columns || [];
                var indexResource = columns.indexOf("resource");
                var indexUsage = columns.indexOf("usage");
                var indexPrice = columns.indexOf("price");

                for (var i = 0; i < points.length; i++) {
                    var meter = points[i];
                    var meterName = meter[indexResource];
                    var meterUsage = meter[indexUsage];
                    var meterPrice = meter[indexPrice];

                    if(!(meterName in formattedData)) {
                        formattedData[meterName] = {
                            resource: meterName,
                            unit: "",
                            usage: 0,
                            rate: 0,
                            price: 0,
                            discount: 0
                        };
                    }

                    var newUsage = formattedData[meterName].usage + meterUsage;
                    var newPrice = formattedData[meterName].price + meterPrice;

                    formattedData[meterName].usage = newUsage;
                    formattedData[meterName].price = newPrice;
                    formattedData[meterName].rate = newPrice / newUsage;
                }
            }
        };

        /**
         * Returns the columns for the new data representation
         *
         * @return {Array}
         */
        this.getFormattedColumns = function(rawColumns) {
            var formattedColumns = ["resource", "unit", "usage", "rate", "charge"];
            return formattedColumns;
        };

        this.getFormattedData = function() {
            return formattedData;
        };
    }

})();
