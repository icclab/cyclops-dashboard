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

describe('OverviewController', function() {
    var $scope;
    var $location;
    var controller;
    var deferred;
    var promise;

    /*
        Fake Data
     */
    var fakeTimeFrom = "00:00";
    var fakeTimeTo = "23:59";
    var fakeDateToday = "2015-03-04";
    var fakeKeystoneId = '123';
    var fakeFrom = "2015-03-04 00:00";
    var fakeTo = "2015-03-04 23:59";
    var fakeResponse = {
        data: {
            'test': 'abc'
        }
    };

    /*
        Test setup
     */
    beforeEach(function() {
        resetAllMocks();

        /*
            Load module
         */
        module('dashboard.overview');

        /*
            Inject dependencies and configure mocks
         */
        inject(function($controller, $q, $rootScope, _$location_) {
            $location = _$location_;
            $scope = $rootScope.$new();
            deferred = $q.defer();
            promise = deferred.promise;

            sessionServiceMock.getKeystoneId.and.returnValue(fakeKeystoneId);
            restServiceMock.getUdrData.and.returnValue(promise);
            restServiceMock.getExternalUserIds.and.returnValue(promise);
            dateUtilMock.getFormattedDateToday.and.returnValue(fakeDateToday);
            dateUtilMock.formatDateFromTimestamp.and.returnValue(fakeDateToday);
            spyOn($scope, '$broadcast');

            controller = $controller('OverviewController', {
                '$scope': $scope,
                'restService': restServiceMock,
                'sessionService': sessionServiceMock,
                'usageDataService': usageDataServiceMock,
                'externalUsageDataService': externalUsageDataServiceMock,
                'alertService': alertServiceMock,
                'dateUtil': dateUtilMock
            });
        });
    });

    /*
        Tests
     */
    describe('updateCharts', function() {
        beforeEach(function() {
            spyOn(controller, 'hasKeystoneId').and.returnValue(true);
            spyOn(controller, 'requestUsage');
            spyOn(controller, 'requestExternalUsage');
        });

        it('should call requestUsage if Keystone ID available', function() {
            controller.updateCharts(fakeFrom, fakeTo);

            expect(controller.hasKeystoneId).toHaveBeenCalled();
            expect(controller.requestUsage)
                .toHaveBeenCalledWith(fakeKeystoneId, fakeFrom, fakeTo);
        });

        it('should do nothing if no Keystone ID available', function() {
            controller.hasKeystoneId.and.returnValue(false);

            controller.updateCharts(fakeDateToday, fakeDateToday);

            expect(controller.hasKeystoneId).toHaveBeenCalled();
            expect(controller.requestUsage).not.toHaveBeenCalled();
        });

        it('should not request external data if no external ID available', function() {
            controller.externalUserIds = [];
            controller.updateCharts(fakeDateToday, fakeDateToday);
            expect(controller.requestExternalUsage).not.toHaveBeenCalled();
        });

        it('should request data for each external User ID', function() {
            controller.externalUserIds = [
                {userId: "test1" },
                {userId: "test2" }
            ];

            controller.updateCharts(fakeDateToday, fakeDateToday);
            expect(controller.requestExternalUsage)
                .toHaveBeenCalledWith("test1", fakeDateToday, fakeDateToday);
            expect(controller.requestExternalUsage)
                .toHaveBeenCalledWith("test2", fakeDateToday, fakeDateToday);
        });
    });

    describe('requestUsage', function() {
        it('should correctly call restService.getUdrData', function() {
            controller.requestUsage(fakeKeystoneId, fakeFrom, fakeTo);
            deferred.resolve(fakeResponse);
            $scope.$digest();

            expect(restServiceMock.getUdrData)
                .toHaveBeenCalledWith(fakeKeystoneId, fakeFrom, fakeTo);
        });

        it('should execute loadUdrDataSuccess on deferred.resolve', function() {
            controller.requestUsage(fakeKeystoneId, fakeFrom, fakeTo);
            deferred.resolve(fakeResponse);
            $scope.$digest();

            expect(usageDataServiceMock.setRawData)
                .toHaveBeenCalledWith(fakeResponse.data);
        });

        it('should excute loadUdrDataFailed on deferred.reject', function() {
            controller.requestUsage(fakeKeystoneId, fakeFrom, fakeTo);
            deferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });
    });

    describe('hasKeystoneId', function() {
        it('should return true if Keystone ID available', function() {
            expect(controller.hasKeystoneId()).toBeTruthy();
        });

        it('should return false if no Keystone ID available', function() {
            sessionServiceMock.getKeystoneId.and.returnValue('');
            expect(controller.hasKeystoneId()).toBeFalsy();
        });
    });

    describe('showCloudServices', function() {
        it('should redirect to /cloud-services', function() {
            controller.showCloudServices();
            expect($location.url()).toBe('/cloudservices');
        });
    });

    describe('onDateChanged', function() {
        it('should correctly call updateCharts', function() {
            spyOn(controller, 'updateCharts');

            controller.onDateChanged(fakeDateToday, fakeDateToday);

            expect(controller.updateCharts).toHaveBeenCalledWith(fakeFrom, fakeTo);
        });
    });

    describe('onDateChanged', function() {
        it('should correctly call updateCharts', function() {
            spyOn(controller, 'updateCharts');

            controller.onDateChanged(fakeDateToday, fakeDateToday);

            expect(controller.updateCharts)
                .toHaveBeenCalledWith(fakeFrom, fakeTo);
        });

        it('should delegate dates to dateUtil for transformation', function() {
            spyOn(controller, 'updateCharts');

            controller.onDateChanged(1, 2);

            expect(dateUtilMock.formatDateFromTimestamp).toHaveBeenCalledWith(1);
            expect(dateUtilMock.formatDateFromTimestamp).toHaveBeenCalledWith(2);
        });
    });

    describe('loadExternalUserIds', function() {
        it('should read the User ID from the session', function() {
            controller.loadExternalUserIds();
            expect(sessionServiceMock.getKeystoneId).toHaveBeenCalled();
        });

        it('should correctly call restService.getExternalUserIds', function() {
            controller.loadExternalUserIds();
            expect(restServiceMock.getExternalUserIds).toHaveBeenCalledWith(fakeKeystoneId);
        });

        it('should execute success callback on deferred.resolve', function() {
            spyOn(controller, "onDateChanged");
            controller.loadExternalUserIds();

            deferred.resolve({ data: [1] });
            $scope.$digest();

            expect(controller.externalUserIds).toEqual([1]);
            expect(controller.onDateChanged).toHaveBeenCalledWith(fakeDateToday, fakeDateToday);
        });

        it('should execute error callback on deferred.reject', function() {
            spyOn(controller, "onDateChanged");
            controller.loadExternalUserIds();

            deferred.reject();
            $scope.$digest();

            expect(controller.externalUserIds).toEqual([]);
            expect(controller.onDateChanged).toHaveBeenCalledWith(fakeDateToday, fakeDateToday);
        });
    });

    describe('requestExternalUsage', function() {
        it('should correctly call restService.getUdrData', function() {
            controller.requestExternalUsage(fakeKeystoneId, fakeFrom, fakeTo);
            expect(restServiceMock.getUdrData)
                .toHaveBeenCalledWith(fakeKeystoneId, fakeFrom, fakeTo);
        });

        it('should execute success callback on deferred.resolve', function() {
            controller.requestExternalUsage(fakeKeystoneId, fakeFrom, fakeTo);

            deferred.resolve({ data: 1 });
            $scope.$digest();

            expect(externalUsageDataServiceMock.setRawData).toHaveBeenCalledWith(1);
            expect(externalUsageDataServiceMock.notifyChartDataReady)
                .toHaveBeenCalledWith($scope);
        });

        it('should execute error callback on deferred.reject', function() {
            controller.requestExternalUsage(fakeKeystoneId, fakeFrom, fakeTo);

            deferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });
    });
});
