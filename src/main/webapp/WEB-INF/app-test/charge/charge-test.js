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

describe('ChargeController', function() {
    var $scope;
    var controller;
    var deferred;
    var promise;
    var externalDeferred;
    var externalPromise;

    /*
        Fake Data
     */
    var fakeDateToday = "2015-03-04";
    var fakeFrom = "2015-03-04 00:00";
    var fakeTo = "2015-03-04 23:59";
    var fakeUser = "192asdk";
    var fakeResponse = {
        data: {
            'test': 'abc'
        }
    };
    var fakeExternalUserIdResponse = {
        data: [
            {userId:"test1"},
            {userId:"test2"}
        ]
    }

    /*
        Test setup
     */
    beforeEach(function() {
        resetAllMocks();

        /*
            Load module
         */
        module('dashboard.charge');

        /*
            Inject dependencies and configure mocks
         */
        inject(function($controller, $q, $rootScope) {
            $scope = $rootScope.$new();
            deferred = $q.defer();
            externalDeferred = $q.defer();
            promise = deferred.promise;
            externalPromise = externalDeferred.promise;

            sessionServiceMock.getKeystoneId.and.returnValue(fakeUser);
            restServiceMock.getChargeForUser.and.returnValue(promise);
            restServiceMock.getExternalUserIds.and.returnValue(externalPromise);
            dateUtilMock.getFormattedDateToday.and.returnValue(fakeDateToday);
            dateUtilMock.formatDateFromTimestamp.and.returnValue(fakeDateToday);
            spyOn($scope, '$broadcast');

            controller = $controller('ChargeController', {
                '$scope': $scope,
                'restService': restServiceMock,
                'sessionService': sessionServiceMock,
                'chargeDataService': chargeDataServiceMock,
                'externalChargeDataService': externalChargeDataServiceMock,
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
            spyOn(controller, 'clearChartDataForUpdate');
            spyOn(controller, 'requestExternalCharge');
            spyOn(controller, 'requestCharge');
        });

        it('should clear chart data for next update', function() {
            controller.updateCharts(fakeUser, fakeFrom, fakeTo);
            expect(controller.clearChartDataForUpdate).toHaveBeenCalled();
        });

        it('should not request external data if no external ID available', function() {
            controller.requestCharge.calls.reset();
            controller.requestExternalCharge.calls.reset();

            controller.externalUserIds = [];
            controller.updateCharts(fakeUser, fakeFrom, fakeTo);

            expect(controller.requestCharge.calls.count()).toBe(1);
            expect(controller.requestExternalCharge).not.toHaveBeenCalled();
        });

        it('should request data for each external User ID', function() {
            controller.requestCharge.calls.reset();
            controller.requestExternalCharge.calls.reset();

            controller.externalUserIds = [
                {userId: "test1"},
                {userId: "test2"}
            ];

            controller.updateCharts(fakeUser, fakeFrom, fakeTo);

            expect(controller.requestCharge)
                .toHaveBeenCalledWith(fakeUser, fakeFrom, fakeTo);
            expect(controller.requestExternalCharge)
                .toHaveBeenCalledWith("test1", fakeFrom, fakeTo);
            expect(controller.requestExternalCharge)
                .toHaveBeenCalledWith("test2", fakeFrom, fakeTo);
        });
    });

    describe('onDateChanged', function() {
        it('should correctly call updateCharts', function() {
            spyOn(controller, 'updateCharts');

            controller.onDateChanged(fakeDateToday, fakeDateToday);

            expect(controller.updateCharts)
                .toHaveBeenCalledWith(fakeUser, fakeFrom, fakeTo);
        });

        it('should delegate dates to dateUtil for transformation', function() {
            spyOn(controller, 'updateCharts');

            controller.onDateChanged(1, 2);

            expect(dateUtilMock.formatDateFromTimestamp).toHaveBeenCalledWith(1);
            expect(dateUtilMock.formatDateFromTimestamp).toHaveBeenCalledWith(2);
        });
    });

    describe('loadExternalUserIds', function() {
        it('should correctly call restService.getExternalUserIds', function() {
            controller.loadExternalUserIds();
            expect(restServiceMock.getExternalUserIds).toHaveBeenCalledWith(fakeUser);
        });

        it('should execute success callback on deferred.resolve', function() {
            spyOn(controller, "updateCharts");
            controller.loadExternalUserIds();

            externalDeferred.resolve({ data: [1] });
            $scope.$digest();

            expect(controller.externalUserIds).toEqual([1]);
            expect(controller.updateCharts).toHaveBeenCalledWith(fakeUser, fakeFrom, fakeTo);
        });

        it('should execute error callback on deferred.reject', function() {
            spyOn(controller, "updateCharts");
            controller.loadExternalUserIds();

            externalDeferred.reject();
            $scope.$digest();

            expect(controller.externalUserIds).toEqual([]);
            expect(controller.updateCharts).toHaveBeenCalledWith(fakeUser, fakeFrom, fakeTo);
        });
    });

    describe('requestExternalCharge', function() {
        it('should correctly call restService.getChargeForUser', function() {
            controller.requestExternalCharge(fakeUser, fakeFrom, fakeTo);
            expect(restServiceMock.getChargeForUser).toHaveBeenCalledWith(fakeUser, fakeFrom, fakeTo);
        });

        it('should execute success callback on deferred.resolve', function() {
            controller.requestExternalCharge(fakeUser, fakeFrom, fakeTo);

            deferred.resolve(fakeResponse);
            $scope.$digest();

            expect(externalChargeDataServiceMock.setRawData).toHaveBeenCalledWith(fakeResponse.data);
            expect(externalChargeDataServiceMock.notifyChartDataReady).toHaveBeenCalled();
        });

        it('should excute error callback on deferred.reject', function() {
            controller.requestCharge(fakeUser, fakeFrom, fakeTo);

            deferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });
    });

    describe('requestCharge', function() {
        it('should correctly call restService.getChargeForUser', function() {
            controller.requestCharge(fakeUser, fakeFrom, fakeTo);
            expect(restServiceMock.getChargeForUser).toHaveBeenCalledWith(fakeUser, fakeFrom, fakeTo);
        });

        it('should execute success callback on deferred.resolve', function() {
            controller.requestCharge(fakeUser, fakeFrom, fakeTo);

            deferred.resolve(fakeResponse);
            $scope.$digest();

            expect(chargeDataServiceMock.setRawData).toHaveBeenCalledWith(fakeResponse.data);
            expect(chargeDataServiceMock.notifyChartDataReady).toHaveBeenCalled();
        });

        it('should excute error callback on deferred.reject', function() {
            controller.requestCharge(fakeUser, fakeFrom, fakeTo);

            deferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });
    });
});
