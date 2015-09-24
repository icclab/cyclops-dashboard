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

describe('BillController', function() {
    var $scope;
    var controller;
    var deferred;
    var promise;

    /*
        Fake Data
     */
    var fakeKeystoneId = "asdl";
    var fakeDate = "2015-04-28";
    var fakeBill = {
        from: "2015-04-28",
        to: "2015-04-29",
        due: "2015-04-30",
        paid: true
    };
    var fakeBillDue = {
        from: "2015-04-16",
        to: "2015-04-17",
        due: "2015-04-27",
        paid: false
    };
    var fakeBills = [
        {
            from: "2015-04-28",
            to: "2015-04-29"
        },
        {
            from: "2015-04-25",
            to: "2015-04-27"
        }
    ];
    var fakeBillResponse = {
        data: fakeBills
    };
    var fakePdfResponse = {
        data: undefined
    };

    /*
        Test setup
     */
    beforeEach(function() {
        resetAllMocks();

        /*
            Load module
         */
        module('dashboard.bills');

        /*
            Inject dependencies and configure mocks
         */
        inject(function($controller, $q, $rootScope) {
            $scope = $rootScope.$new();
            deferred = $q.defer();
            promise = deferred.promise;

            sessionServiceMock.getKeystoneId.and.returnValue(fakeKeystoneId);
            restServiceMock.getBills.and.returnValue(promise);
            restServiceMock.getBillPDF.and.returnValue(promise);
            dateUtilMock.getFormattedDateToday.and.returnValue(fakeDate);
            dateUtilMock.compareDateStrings.and.returnValue(-1);

            controller = $controller('BillController', {
                '$scope': $scope,
                '$modal': modalMock,
                'sessionService': sessionServiceMock,
                'restService': restServiceMock,
                'billDataService': billDataServiceMock,
                'alertService': alertServiceMock,
                'dateUtil': dateUtilMock
            });
        });
    });

    /*
        Tests
     */
    describe('getClassForBill', function() {
        it('should return "success" if bill is "paid"', function() {
            expect(controller.getClassForBill(fakeBill)).toBe("success");
        });

        it('should return "info" if bill is "running"', function() {
            dateUtilMock.compareDateStrings.and.returnValue(-1);
            expect(controller.getClassForBill(fakeBillDue)).toBe("info");
        });

        it('should return "danger" if bill is "due"', function() {
            dateUtilMock.compareDateStrings.and.returnValue(1);
            expect(controller.getClassForBill(fakeBillDue)).toBe("danger");
        });
    });

    describe('getBills', function() {
        it('should correctly call restService.getBills', function() {
            controller.getBills(fakeKeystoneId);
            expect(restServiceMock.getBills).toHaveBeenCalledWith(fakeKeystoneId);
        });

        it('should execute success callback on deferred.resolve', function() {
            controller.getBills(fakeKeystoneId);

            deferred.resolve(fakeBillResponse);
            $scope.$digest();

            expect(controller.bills).toEqual(fakeBills);
        });

        it('should execute error callback on deferred.reject', function() {
            controller.getBills(fakeKeystoneId);

            deferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });
    });

    describe('showDetails', function() {
        it('should correctly call restService.getBillPDF', function() {
            controller.showDetails(fakeBill);
            expect(restServiceMock.getBillPDF)
                .toHaveBeenCalledWith(fakeKeystoneId, fakeBill.from, fakeBill.to);
        });

        it('should execute success callback on deferred.resolve', function() {
            spyOn(window, 'Blob');
            spyOn(controller, 'openModal');

            controller.showDetails(fakeBill);

            deferred.resolve(fakePdfResponse);
            $scope.$digest();

            expect(controller.openModal).toHaveBeenCalledWith(fakePdfResponse.data);
        });

        it('should execute error callback on deferred.reject', function() {
            controller.getBills(fakeKeystoneId);

            deferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });
    });
});
