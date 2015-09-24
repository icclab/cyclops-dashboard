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

describe('AdminRateController', function() {
    var $scope;
    var controller;
    var policyDeferred;
    var udrDeferred;
    var policyPromise;
    var udrPromise;

    /*
        Fake Data
     */
    var disabledClass = "disabled";
    var enabledClass = "";
    var statusStringDynamic = "Dynamic Rating";
    var statusStringStatic = "Static Rating";
    var fakeDateTime = "2015-03-21 15:14:13";
    var fakeMeters = {
        "meter.name1": { name: "meter.name1", rate: 3 },
        "meter.name2": { name: "meter.name2", rate: 4 }
    };
    var fakeMetersIllegal = {
        "meter.name1": { name: "meter.name1", rate: "a" },
        "meter.name2": { name: "meter.name2", rate: -5 }
    };
    var fakeStaticRateConfig = {
        "source": "dashboard",
        "time": fakeDateTime,
        "rate_policy": "static",
        "rate": {
            "meter.name1": 3,
            "meter.name2": 4
        }
    };
    var fakeStaticRateConfigFixed = {
        "source": "dashboard",
        "time": fakeDateTime,
        "rate_policy": "static",
        "rate": {
            "meter.name1": 1,
            "meter.name2": 1
        }
    };
    var fakeDynamicRateConfig = {
        "source": "dashboard",
        "time": fakeDateTime,
        "rate_policy": "dynamic",
        "rate": null
    };
    var fakeResponseDynamic = {
        data: fakeDynamicRateConfig
    };
    var fakeResponseStatic = {
        data: fakeStaticRateConfig
    };
    var fakeUdrMeterResponse = {
        data: {
            name: "meterselection",
            columns: ["time", "source", "metersource", "metertype", "metername", "status"],
            points: [
                [1425399530223, "cyclops-ui", "openstack", "gauge", "a.test1", 0],
                [1425399530223, "cyclops-ui", "openstack", "cumulative", "b.test2", 1]
            ]
        }
    };
    var fakeMetersAfterFilter = {
        "b.test2": { name: "b.test2", rate: 1 }
    };
    var fakeMetersBeforeFilter = {
        "b.test2": { name: "b.test2", rate: 3 }
    };
    var fakeMetersAfterFilterUntouched = {
        "b.test2": { name: "b.test2", rate: 3 }
    };

    /*
        Test setup
     */
    beforeEach(function() {
        resetAllMocks();

        /*
            Load module
         */
        module('dashboard.admin.rate');

        /*
            Inject dependencies and configure mocks
         */
        inject(function($controller, $q, $rootScope) {
            $scope = $rootScope.$new();
            policyDeferred = $q.defer();
            udrDeferred = $q.defer();
            policyPromise = policyDeferred.promise;
            udrPromise = udrDeferred.promise;

            restServiceMock.getUdrMeters.and.returnValue(udrPromise);
            restServiceMock.setActiveRatePolicy.and.returnValue(policyPromise);
            restServiceMock.getActiveRatePolicy.and.returnValue(policyPromise);
            responseParserMock.getStaticRatingListFromResponse.and.returnValue(fakeMeters);
            dateUtilMock.getFormattedDateTimeNow.and.returnValue(fakeDateTime);

            controller = $controller('AdminRateController', {
                '$scope': $scope,
                'restService': restServiceMock,
                'alertService': alertServiceMock,
                'meterselectionDataService': meterselectionDataServiceMock,
                'responseParser': responseParserMock,
                'dateUtil': dateUtilMock,
            });
        });
    });

    /*
        Tests
     */
    describe('setGuiStaticRateEnabled', function() {
        it('should correctly set GUI variables', function() {
            controller.isStaticRateEnabled = false;
            controller.staticRatingButtonClass = enabledClass;
            controller.dynamicRatingButtonClass = disabledClass;

            controller.setGuiStaticRateEnabled();

            expect(controller.isStaticRateEnabled).toBeTruthy();
            expect(controller.staticRatingButtonClass).toEqual(disabledClass);
            expect(controller.dynamicRatingButtonClass).toEqual(enabledClass);
        });
    });

    describe('setGuiDynamicRateEnabled', function() {
        it('should correctly set GUI variables', function() {
            controller.isStaticRateEnabled = true;
            controller.staticRatingButtonClass = disabledClass;
            controller.dynamicRatingButtonClass = enabledClass;

            controller.setGuiDynamicRateEnabled();

            expect(controller.isStaticRateEnabled).toBeFalsy();
            expect(controller.staticRatingButtonClass).toEqual(enabledClass);
            expect(controller.dynamicRatingButtonClass).toEqual(disabledClass);
        });
    });

    describe('setGuiActivePolicyStatic', function() {
        it('should correctly set status string', function() {
            controller.activePolicyStatusString = statusStringDynamic;
            controller.setGuiActivePolicyStatic();
            expect(controller.activePolicyStatusString).toEqual(statusStringStatic)
        });
    });

    describe('setGuiActivePolicyDynamic', function() {
        it('should correctly set status string', function() {
            controller.activePolicyStatusString = statusStringStatic;
            controller.setGuiActivePolicyDynamic();
            expect(controller.activePolicyStatusString).toEqual(statusStringDynamic)
        });
    });

    describe('buildStaticRateConfig', function() {
        it('should build a correct config object', function() {
            controller.meters = fakeMeters;
            var res = controller.buildStaticRateConfig();
            expect(res).toEqual(fakeStaticRateConfig);
        });

        it('should replace illegal values with 1', function() {
            controller.meters = fakeMetersIllegal;
            var res = controller.buildStaticRateConfig();
            expect(res).toEqual(fakeStaticRateConfigFixed);
        });
    });

    describe('buildDynamicRateConfig', function() {
        it('should build a correct config object', function() {
            var res = controller.buildDynamicRateConfig();
            expect(res).toEqual(fakeDynamicRateConfig);
        });
    });

    describe('activatePolicyStatic', function() {
        beforeEach(function() {
            spyOn(controller, 'buildStaticRateConfig').and.returnValue(fakeStaticRateConfig);
            spyOn(controller, 'setGuiActivePolicyStatic');
        });

        it('should call buildStaticRateConfig', function() {
            controller.activatePolicyStatic();
            expect(controller.buildStaticRateConfig).toHaveBeenCalled();
        });

        it('should correctly call restService.setActiveRatePolicy', function() {
            var res = controller.activatePolicyStatic();
            expect(restServiceMock.setActiveRatePolicy)
                .toHaveBeenCalledWith(fakeStaticRateConfig);
        });

        it('should execute success callback on policyDeferred.resolve', function() {
            controller.activatePolicyStatic();
            policyDeferred.resolve(fakeResponseDynamic);
            $scope.$digest();

            expect(alertServiceMock.showSuccess).toHaveBeenCalled();
            expect(controller.setGuiActivePolicyStatic).toHaveBeenCalled();
        });

        it('should execute error callback on policyDeferred.reject', function() {
            controller.activatePolicyStatic();
            policyDeferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
            expect(controller.setGuiActivePolicyStatic).not.toHaveBeenCalled();
        });
    });

    describe('onLoad', function() {
        it('should call restService.getActiveRatePolicy', function() {
            controller.onLoad();
            expect(restServiceMock.getActiveRatePolicy).toHaveBeenCalled();
        });

        it('should execute callback on policyDeferred.resolve', function() {
            spyOn(controller, 'prepareGuiByActivePolicy');

            controller.onLoad();
            policyDeferred.resolve(fakeResponseDynamic);
            $scope.$digest();
            expect(restServiceMock.getUdrMeters).toHaveBeenCalled();
            expect(controller.prepareGuiByActivePolicy)
                .toHaveBeenCalledWith(fakeDynamicRateConfig);
        });

        it('should execute callback on udrDeferred.resolve', function() {
            spyOn(controller, 'filterEnabledMeters');

            controller.onLoad();
            policyDeferred.resolve(fakeResponseDynamic);
            udrDeferred.resolve(fakeUdrMeterResponse);
            $scope.$digest();

            expect(controller.filterEnabledMeters)
                .toHaveBeenCalledWith(fakeUdrMeterResponse);
        });

        it('should execute error callback on policyDeferred.reject', function() {
            controller.onLoad();
            policyDeferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });

        it('should execute error callback on udrDeferred.reject', function() {
            controller.onLoad();
            policyDeferred.resolve(fakeResponseDynamic);
            udrDeferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });
    });

    describe('prepareGuiByActivePolicy', function() {
        beforeEach(function(){
            spyOn(controller, 'setGuiStaticRateEnabled');
            spyOn(controller, 'setGuiDynamicRateEnabled');
            spyOn(controller, 'setGuiActivePolicyStatic');
            spyOn(controller, 'setGuiActivePolicyDynamic');
        });

        it('should execute static path for static policy data', function() {
            controller.prepareGuiByActivePolicy(fakeStaticRateConfig);
            expect(controller.setGuiStaticRateEnabled).toHaveBeenCalled();
            expect(controller.setGuiActivePolicyStatic).toHaveBeenCalled();
            expect(controller.setGuiDynamicRateEnabled).not.toHaveBeenCalled();
            expect(controller.setGuiActivePolicyDynamic).not.toHaveBeenCalled();
            expect(responseParserMock.getStaticRatingListFromResponse)
                .toHaveBeenCalledWith(fakeStaticRateConfig);
        });

        it('should execute dynamic path for dynamic policy data', function() {
            controller.prepareGuiByActivePolicy(fakeDynamicRateConfig);
            expect(controller.setGuiStaticRateEnabled).not.toHaveBeenCalled();
            expect(controller.setGuiActivePolicyStatic).not.toHaveBeenCalled();
            expect(controller.setGuiDynamicRateEnabled).toHaveBeenCalled();
            expect(controller.setGuiActivePolicyDynamic).toHaveBeenCalled();
        });
    });

    describe('filterEnabledMeters', function() {
        it('should filter meters correctly on normal response', function() {
            controller.meters = {};
            controller.filterEnabledMeters(fakeUdrMeterResponse);
            expect(controller.meters).toEqual(fakeMetersAfterFilter);
        });

        it('should consider preconfigured meters', function() {
            controller.meters = fakeMetersBeforeFilter;
            controller.filterEnabledMeters(fakeUdrMeterResponse);
            expect(controller.meters).toEqual(fakeMetersAfterFilterUntouched);
        });
    });

});
