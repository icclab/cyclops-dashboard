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

describe('AdminMeterController', function() {
    var controller;
    var $scope;
    var keystoneDeferred;
    var udrDeferred;
    var keystonePromise;
    var udrPromise;

    /*
        Fake Data
     */
    var fakeMeters = [
        { name:'a.test1', type:'gauge', source:'openstack' },
        { name:'b.test2', type:'cumulative', source:'openstack' },
        { name:'external.test', type:'gauge', source:'external' },
        { name:'a.test1', type:'delta', source:'openstack' }
    ];
    var fakeMetersWithSelection = [
        { name:'a.test1', type:'gauge', source:'openstack', enabled: false },
        { name:'b.test2', type:'cumulative', source:'openstack', enabled: true }
    ];
    var fakeUniqueMeters = {
        'a.test1': fakeMeters[0],
        'b.test2': fakeMeters[1]
    };
    var fakeExternalMeter = {
        name: "external.test",
        enabled: false,
        type: "external",
        source: "test-source"
    };
    var fakeUniqueMetersAfterPreselection = {
        'a.test1': fakeMetersWithSelection[0],
        'b.test2': fakeMetersWithSelection[1]
    };
    var fakeResponse = {
        data: fakeMeters
    };
    var fakeToggleMeterName = "toggle.test";
    var fakeMeterSelected = { 'toggle.test': { enabled: true } };
    var fakeMeterUnselected = { 'toggle.test': { enabled: false } };
    var fakeMeterEmpty = { 'toggle.test' : {} };
    var fakeTimestamp = 1425399530223;
    var fakeColumns = [
        "time", "source", "metersource", "metertype", "metername", "status"
    ];
    var fakePointUnselected1 = [
        fakeTimestamp, "cyclops-ui", "openstack", "gauge", "a.test1", 0
    ];
    var fakePointUnselected2 = [
        fakeTimestamp, "cyclops-ui", "openstack", "cumulative", "b.test2", 0
    ];
    var fakePointSelected = [
        fakeTimestamp, "cyclops-ui", "openstack", "cumulative", "b.test2", 1
    ];
    var fakeUdrRequestBody = {
        name: "meterselection",
        columns: fakeColumns,
        points: [
            fakePointUnselected1,
            fakePointUnselected2
        ]
    };
    var fakeUdrMeterResponse = {
        data: fakeUdrRequestBody
    };
    var fakeFormattedUdrData = {
        "a.test1": {
            name: "a.test1",
            enabled: false,
            type: "gauge",
            source: "openstack"
        },
        "b.test2": {
            name: "b.test2",
            enabled: true,
            type: "cumulative",
            source: "openstack"
        },
        "external.test": fakeExternalMeter
    };
    var fakeMeterMapAfterExternalMeters = {
        "external.test": fakeExternalMeter
    };
    var fakeFormattedOpenstackData = fakeFormattedUdrData;

    /*
        Test setup
     */
    beforeEach(function() {

        /*
            Load module
         */
        module('dashboard.admin.meters');

        /*
            Inject dependencies and configure mocks
         */
        inject(function($controller, $q, $rootScope, _$log_) {
            $scope = $rootScope.$new();
            keystoneDeferred = $q.defer();
            keystonePromise = keystoneDeferred.promise;
            udrDeferred = $q.defer();
            udrPromise = udrDeferred.promise;

            restServiceMock.getKeystoneMeters.and.returnValue(keystonePromise);
            restServiceMock.getUdrMeters.and.returnValue(udrPromise);
            restServiceMock.updateUdrMeters.and.returnValue(udrPromise);
            restServiceMock.addExternalMeterSource.and.returnValue(udrPromise);
            meterselectionDataServiceMock.getFormattedUdrData.and.returnValue(fakeFormattedUdrData);
            meterselectionDataServiceMock.getFormattedOpenstackData.and.returnValue(fakeFormattedOpenstackData);
            dateUtilMock.getTimestamp.and.returnValue(fakeTimestamp);

            controller = $controller('AdminMeterController', {
                '$scope': $scope,
                'restService': restServiceMock,
                'meterselectionDataService': meterselectionDataServiceMock,
                'alertService': alertServiceMock,
                'dateUtil': dateUtilMock
            });
        });
    });

    /*
        Tests
     */
    describe('loadMeterData', function() {
        it('should correctly call restService.getKeystoneMeters', function() {
            controller.loadMeterData();
            expect(restServiceMock.getKeystoneMeters).toHaveBeenCalled();
        });

        it('should execute loadKeystoneMeterSuccess on keystoneDeferred.resolve', function() {
            controller.loadMeterData();
            keystoneDeferred.resolve(fakeResponse);
            $scope.$digest();

            expect(meterselectionDataServiceMock.setRawOpenstackData)
                .toHaveBeenCalledWith(fakeResponse.data);

            expect(restServiceMock.getUdrMeters).toHaveBeenCalled();
        });

        it('should execute loadUdrMeterSuccess on udrDeferred.resolve', function() {
            spyOn(controller, 'addExternalMetersToMap');
            spyOn(controller, 'preselectMeters');

            controller.loadMeterData();
            keystoneDeferred.resolve(fakeResponse);
            udrDeferred.resolve(fakeUdrMeterResponse);
            $scope.$digest();

            expect(meterselectionDataServiceMock.setRawUdrData).toHaveBeenCalled();
            expect(meterselectionDataServiceMock.getFormattedOpenstackData).toHaveBeenCalled();
            expect(controller.addExternalMetersToMap).toHaveBeenCalledWith();
            expect(controller.preselectMeters).toHaveBeenCalledWith();
        });

        it('should execute loadMeterError on keystoneDeferred.reject', function() {
            controller.loadMeterData();
            keystoneDeferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });

        it('should execute loadMeterError on udrDeferred.reject', function() {
            controller.loadMeterData();
            keystoneDeferred.resolve(fakeResponse);
            udrDeferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });
    });

    describe('updateUdrMeters', function() {
        it('should correctly call restService.updateUdrMeters', function() {
            controller.meterMap = fakeUniqueMeters;
            controller.updateUdrMeters();
            expect(restServiceMock.updateUdrMeters)
                .toHaveBeenCalledWith(fakeUdrRequestBody);
        });

        it('should execute updateMeterSuccess on udrDeferred.reject', function() {
            spyOn(controller, 'buildUdrRequest');

            controller.updateUdrMeters();
            udrDeferred.resolve(fakeResponse);
            $scope.$digest();

            expect(alertServiceMock.showSuccess).toHaveBeenCalled();
        });

        it('should execute updateMeterError on udrDeferred.reject', function() {
            spyOn(controller, 'buildUdrRequest');

            controller.updateUdrMeters();
            udrDeferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });
    });

    describe('toggleMeter', function() {
        beforeEach(function() {
            fakeMeterSelected['toggle.test'].enabled = true;
            fakeMeterUnselected['toggle.test'].enabled = false;
        });

        it('should set the meter to selected = false if unselected', function() {
            controller.meterMap = fakeMeterSelected;
            controller.toggleMeter(fakeToggleMeterName);
            expect(controller.meterMap).toEqual(fakeMeterUnselected);
        });

        it('should set the meter to selected = true if selected', function() {
            controller.meterMap = fakeMeterUnselected;
            controller.toggleMeter(fakeToggleMeterName);
            expect(controller.meterMap).toEqual(fakeMeterSelected);
        });

        it('should set the meter to selected = true if selected on empty meter', function() {
            controller.meterMap = fakeMeterEmpty;
            controller.toggleMeter(fakeToggleMeterName);
            expect(controller.meterMap).toEqual(fakeMeterSelected);
        });
    });

    describe('buildUdrRequest', function() {
        it('should build a full request body JSON object', function() {
            controller.meterMap = fakeUniqueMeters;
            var res = controller.buildUdrRequest();
            expect(res).toEqual(fakeUdrRequestBody);
        });
    });

    describe('preselectMeters', function() {
        it('should select correct meters', function() {
            controller.meterMap = fakeUniqueMeters;
            controller.preselectMeters();
            expect(meterselectionDataServiceMock.getFormattedUdrData).toHaveBeenCalled();
            expect(controller.meterMap).toEqual(fakeUniqueMetersAfterPreselection);
        });
    });

    describe('addExternalMetersToMap', function() {
        it('should get meters from meterselectionDataService', function() {
            controller.addExternalMetersToMap();
            expect(meterselectionDataServiceMock.getFormattedUdrData).toHaveBeenCalled();
        });

        it('should add all external meters', function() {
            controller.meterMap = {};
            controller.addExternalMetersToMap();
            expect(controller.meterMap).toEqual(fakeMeterMapAfterExternalMeters);
        });
    });

    describe('addExternalMeter', function() {
        it('should add a new meter', function() {
            controller.meterMap = {};
            controller.addExternalMeter("test-name", "test-source");
            expect(controller.meterMap).toEqual({
                "test-name": {
                    name: "test-name",
                    enabled: true,
                    type: "external",
                    source: "test-source"
                }
            });
        });

        it('should overwrite existing meter', function() {
            controller.meterMap = fakeMeterMapAfterExternalMeters;
            controller.addExternalMeter(fakeExternalMeter.name, fakeExternalMeter.source);
            expect(controller.meterMap).toEqual({
                "external.test": {
                    name: fakeExternalMeter.name,
                    enabled: !(fakeExternalMeter.enabled),
                    type: fakeExternalMeter.type,
                    source: fakeExternalMeter.source
                }
            });
        });

        it('should correctly call restService.addExternalMeterSource', function() {
            controller.addExternalMeter(fakeExternalMeter.name, fakeExternalMeter.source);
            expect(restServiceMock.addExternalMeterSource)
                .toHaveBeenCalledWith(fakeExternalMeter.source);
        });
    });

    describe('isExternalMeter', function() {
        it('should return true if meter is external', function() {
            expect(controller.isExternalMeter({type: "external"})).toBeTruthy();
        });

        it('should return false if meter is internal', function() {
            expect(controller.isExternalMeter({type: "openstack"})).toBeFalsy();
        });
    });
});
