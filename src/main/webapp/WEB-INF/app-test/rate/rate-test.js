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

describe('RateController', function() {
    var $scope;
    var controller;
    var deferred;
    var promise;

    /*
        Fake Data
     */
    var fakeDateToday = "2015-03-04";
    var fakeFrom = fakeDateToday + " 00:00";
    var fakeTo = fakeDateToday + " 23:59";
    var fakeMeters = ["network.incoming.bytes", "cpu_util"];
    var fakeResponse = {
        data: {
            'test': 'abc'
        }
    };
    var fakeFormattedMeters = {
        'cpu_util': { enabled: true },
        'network.incoming.bytes': { enabled: false },
        'network.outgoing.bytes': { enabled: true },
    };
    var fakeSelectedMeterNames = ['cpu_util', 'network.outgoing.bytes'];

    /*
        Test setup
     */
    beforeEach(function() {
        resetAllMocks();

        /*
            Load module
         */
        module('dashboard.rate');

        /*
            Inject dependencies and configure mocks
         */
        inject(function($controller, $q, $rootScope) {
            $scope = $rootScope.$new();
            deferred = $q.defer();
            promise = deferred.promise;

            meterselectionDataServiceMock.getFormattedUdrData.and.returnValue(fakeFormattedMeters);
            meterselectionDataServiceMock.getSelectedMeterNames.and.returnValue(fakeSelectedMeterNames);
            restServiceMock.getRateForMeter.and.returnValue(promise);
            restServiceMock.getUdrMeters.and.returnValue(promise);
            dateUtilMock.getFormattedDateToday.and.returnValue(fakeDateToday);
            spyOn($scope, '$broadcast');

            controller = $controller('RateController', {
                '$scope': $scope,
                'restService': restServiceMock,
                'sessionService': sessionServiceMock,
                'rateDataService': rateDataServiceMock,
                'meterselectionDataService': meterselectionDataServiceMock,
                'alertService': alertServiceMock,
                'dateUtil': dateUtilMock
            });
        });
    });

    /*
        Tests
     */
    describe('requestRatesForMeters', function() {
        it('should correctly call restService.getRateForMeter', function() {
            controller.requestRatesForMeters(fakeMeters, fakeFrom, fakeTo);
            deferred.resolve(fakeResponse);
            $scope.$digest();

            expect(restServiceMock.getRateForMeter)
                .toHaveBeenCalledWith(fakeMeters[0], fakeFrom, fakeTo);

            expect(restServiceMock.getRateForMeter)
                .toHaveBeenCalledWith(fakeMeters[1], fakeFrom, fakeTo);
        });

        it('should execute success callback on deferred.resolve', function() {
            controller.requestRatesForMeters(fakeMeters, fakeFrom, fakeTo);
            deferred.resolve(fakeResponse);
            $scope.$digest();

            expect(rateDataServiceMock.setRawData)
                .toHaveBeenCalledWith(fakeResponse.data);

            expect(rateDataServiceMock.notifyChartDataReady).toHaveBeenCalled();
        });

        it('should excute error callback on deferred.reject', function() {
            controller.requestRatesForMeters(fakeMeters, fakeFrom, fakeTo);
            deferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });
    });

    describe('loadMeterSelection', function() {
        it('should correctly call restService.getUdrMeters', function() {
            controller.loadMeterSelection();
            expect(restServiceMock.getUdrMeters).toHaveBeenCalled();
        });

        it('should execute success callback on deferred.resolve', function() {
            spyOn(controller, 'requestRatesForMeters');

            controller.loadMeterSelection();
            deferred.resolve(fakeResponse);
            $scope.$digest();

            expect(meterselectionDataServiceMock.setRawUdrData)
                .toHaveBeenCalledWith(fakeResponse.data);
            expect(meterselectionDataServiceMock.getSelectedMeterNames)
                .toHaveBeenCalled();
            expect(controller.requestRatesForMeters)
                .toHaveBeenCalledWith(fakeSelectedMeterNames, fakeFrom, fakeTo);
        });

        it('should excute error callback on deferred.reject', function() {
            controller.loadMeterSelection();
            deferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });
    });

    describe('onDateChanged', function() {
        it('should correctly call meterselectionDataService.getSelectedMeterNames', function() {
            spyOn(controller, 'requestRatesForMeters');

            controller.onDateChanged(fakeDateToday, fakeDateToday);

            expect(meterselectionDataServiceMock.getSelectedMeterNames)
                .toHaveBeenCalled();
        });

        it('should correctly call restService.requestCharge', function() {
            spyOn(controller, 'requestRatesForMeters');

            controller.onDateChanged(fakeDateToday, fakeDateToday);

            expect(controller.requestRatesForMeters)
                .toHaveBeenCalledWith(fakeSelectedMeterNames, fakeFrom, fakeTo);
        });

        it('should delegate dates to dateUtil for transformation', function() {
            spyOn(controller, 'requestRatesForMeters');

            controller.onDateChanged(1, 2);

            expect(dateUtilMock.formatDateFromTimestamp).toHaveBeenCalledWith(1);
            expect(dateUtilMock.formatDateFromTimestamp).toHaveBeenCalledWith(2);
        });
    });
});
