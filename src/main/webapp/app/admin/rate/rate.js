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
    angular.module('dashboard.admin.rate')
        .controller('AdminRateController', AdminRateController);

    /*
        Controllers, Factories, Services, Directives
    */
    AdminRateController.$inject = [
        'restService', 'alertService', 'meterselectionDataService',
        'responseParser', 'dateUtil'
    ];
    function AdminRateController(
            restService, alertService, meterselectionDataService,
            responseParser, dateUtil) {
        var me = this;
        this.isStaticRateEnabled = false;
        this.activePolicyStatusString = "Dynamic Rating";
        this.staticRatingButtonClass = "";
        this.dynamicRatingButtonClass = "disabled";
        this.meters = {};

        var onGetActivePolicyError = function(response) {
            alertService.showError("Could not determine rate policy");
        };

        var onActivatePolicyStaticSuccess = function(response) {
            alertService.showSuccess("Successfully switched to Static Rating");
            me.setGuiActivePolicyStatic();
        };

        var onActivatePolicyStaticError = function(response) {
            alertService.showError("Could not switch to StaticRating");
        };

        var onActivatePolicyDynamicSuccess = function(response) {
            alertService.showSuccess("Successfully switched to Dynamic Rating");
            me.setGuiActivePolicyDynamic();
        };

        var onActivatePolicyDynamicError = function(response) {
            alertService.showError("Could switch to Dynamic Rating");
        };

        this.setGuiStaticRateEnabled = function() {
            me.isStaticRateEnabled = true;
            me.staticRatingButtonClass = "disabled";
            me.dynamicRatingButtonClass = "";
        };

        this.setGuiDynamicRateEnabled = function() {
            me.isStaticRateEnabled = false;
            me.staticRatingButtonClass = "";
            me.dynamicRatingButtonClass = "disabled";
        };

        this.setGuiActivePolicyStatic = function() {
            me.activePolicyStatusString = "Static Rating";
        };

        this.setGuiActivePolicyDynamic = function() {
            me.activePolicyStatusString = "Dynamic Rating";
        };

        this.buildDynamicRateConfig = function() {
            return {
                source : "dashboard",
                time: dateUtil.getFormattedDateTimeNow(),
                rate_policy : "dynamic",
                rate : null
            };
        };

        this.buildStaticRateConfig = function() {
            var rates = {};

            for(var meterName in me.meters) {
                var meter = me.meters[meterName];
                var rate = meter.rate;

                //replace illegal numbers / strings with 1
                if(isNaN(rate) || rate < 0) {
                    rate = 1;
                }

                rates[meterName] = rate;
            }

            return {
                source: "dashboard",
                rate_policy: "static",
                time: dateUtil.getFormattedDateTimeNow(),
                rate: rates
            };
        };

        this.activatePolicyStatic = function() {
            var config = me.buildStaticRateConfig();

            restService.setActiveRatePolicy(config)
                .then(onActivatePolicyStaticSuccess, onActivatePolicyStaticError);
        };

        this.activatePolicyDynamic = function() {
            var config = me.buildDynamicRateConfig();

            restService.setActiveRatePolicy(config)
                .then(onActivatePolicyDynamicSuccess, onActivatePolicyDynamicError);
        };

        this.filterEnabledMeters = function(udrMeterResponse) {
            meterselectionDataService.setRawUdrData(udrMeterResponse.data);
            var udrMeters = meterselectionDataService.getFormattedUdrData();

            for(var udrMeterName in udrMeters) {
                var meter = udrMeters[udrMeterName];

                if(meter.enabled && !(udrMeterName in me.meters)) {
                    /*
                        Scenario 1: show all meters that are enabled. We have to add
                        them to the me.meters array even though they were not listed
                        by the static rating response
                     */
                    me.meters[udrMeterName] = {
                        'name': udrMeterName,
                        'rate': 1
                    };
                }
                else if(!meter.enabled && udrMeterName in me.meters) {
                    /*
                        Scenario 2: hide all meters that are disabled, even if they
                        were listed by the static rating response. Reason: The meter
                        selection might have changed since the rating policy was last
                        updated
                     */
                    delete me.meters[udrMeterName];
                }
            }
        };

        this.prepareGuiByActivePolicy = function(policyData) {
            var policy = policyData.rate_policy || "";

            if(policy == "static") {
                me.meters = responseParser.getStaticRatingListFromResponse(policyData);
                me.setGuiStaticRateEnabled();
                me.setGuiActivePolicyStatic();
            }
            else {
                me.setGuiDynamicRateEnabled();
                me.setGuiActivePolicyDynamic();
            }
        };

        this.onLoad = function() {
            restService.getActiveRatePolicy()
                .then(function(response) {
                    me.prepareGuiByActivePolicy(response.data);
                    return restService.getUdrMeters();
                })
                .then(me.filterEnabledMeters, onGetActivePolicyError);
        };

        this.onLoad();
    }

})();
