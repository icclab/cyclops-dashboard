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

describe('AdminBillingController', function() {
    var $scope;
    var controller;
    var userInfoDeferred;
    var userInfoPromise;
    var billDetailsDeferred;
    var billDetailsPromise;
    var billDeferred;
    var billPromise;
    var externalBillDetailsDeferred;
    var externalBillDetailsPromise;
    var externalIdsDeferred;
    var externalIdsPromise;

    /*
        Fake Data
     */
    var fakeUser = "testUser";
    var fakeKeystoneId = "asdk123kas";
    var fakeDate = "2015-02-03";
    var fakeFromDateTime = fakeDate + " 00:00";
    var fakeToDateTime = fakeDate + " 23:59";
    var fakeSessionId = "1234";
    var fakeUsers = ['user1', 'user2'];
    var fakeUserInfo = {
        keystoneid: [ fakeKeystoneId ]
    };
    var fakeUserInfoResponse = {
        data: fakeUserInfo
    };
    var fakeUserInfoResponseNoId = {
        data: {}
    };
    var fakeUserResponse = {
        data: {
            result: fakeUsers
        }
    };
    var fakeBillDetailsResponse = {
        data: {}
    };
    var fakeBillResponse = {
        data: {}
    };
    var fakeBillData = {
        'network.incoming.bytes': {
            resource: 'network.incoming.bytes',
            price: 3
        }
    };
    var fakeExternalUserIds = [
        {source:"testApp", userId:"uid1"},
        {source:"testApp2", userId:"uid2"}
    ];
    var fakePromiseResult = {
        userId: fakeKeystoneId,
        from: fakeDate,
        to: fakeDate,
        billItems: fakeBillData,
        externalUserIds: fakeExternalUserIds
    };
    var fakePromiseResultWithDueDate = {
        userId: fakeKeystoneId,
        from: fakeDate,
        to: fakeDate,
        due: fakeDate,
        billItems: fakeBillData,
        externalUserIds: fakeExternalUserIds
    };

    /*
        Test setup
     */
    beforeEach(function(){
        resetAllMocks();

        /*
            Load module
         */
        module('dashboard.admin.billing');

        /*
            Inject dependencies and configure mocks
         */
        inject(function($controller, $q, $rootScope) {
            $scope = $rootScope.$new();
            userInfoDeferred = $q.defer();
            userInfoPromise = userInfoDeferred.promise;
            billDetailsDeferred = $q.defer();
            billDetailsPromise = billDetailsDeferred.promise;
            billDeferred = $q.defer();
            billPromise = billDeferred.promise;
            externalBillDetailsDeferred = $q.defer();
            externalBillDetailsPromise = externalBillDetailsDeferred.promise;
            externalIdsDeferred = $q.defer();
            externalIdsPromise = externalIdsDeferred.promise;

            restServiceMock.getUsers.and.returnValue(userInfoPromise);
            restServiceMock.getUserInfo.and.returnValue(userInfoPromise);
            restServiceMock.getBillingInformation.and.returnValue(billDetailsPromise);
            restServiceMock.createBillPDF.and.returnValue(billPromise);
            restServiceMock.getExternalUserIds.and.returnValue(externalBillDetailsPromise);
            sessionServiceMock.getSessionId.and.returnValue(fakeSessionId);
            responseParserMock.getUserListFromResponse.and.returnValue(fakeUsers);
            dateUtilMock.formatDateFromTimestamp.and.returnValue(fakeDate);
            dateUtilMock.addDaysToDateString.and.returnValue(fakeDate);
            billDataServiceMock.getFormattedData.and.returnValue(fakeBillData);

            controller = $controller('AdminBillingController', {
                '$scope': $scope,
                '$q': $q,
                '$modal': modalMock,
                'sessionService': sessionServiceMock,
                'restService': restServiceMock,
                'billDataService': billDataServiceMock,
                'alertService': alertServiceMock,
                'responseParser': responseParserMock,
                'dateUtil': dateUtilMock
            });

        });
    });

    /*
        Tests
     */
    describe('getUsers', function() {
        it('should correctly call restService.getUsers', function() {
            controller.getUsers();
            expect(restServiceMock.getUsers).toHaveBeenCalledWith(fakeSessionId);
        });

        it('should execute success callback on deferred.resolve', function() {
            controller.users = [];

            controller.getUsers();
            userInfoDeferred.resolve(fakeUserResponse);
            $scope.$digest();

            expect(responseParserMock.getUserListFromResponse)
                .toHaveBeenCalledWith(fakeUserResponse.data);
            expect(controller.users).toEqual(fakeUsers);
        });

        it('should execute error callback on deferred.reject', function() {
            controller.getUsers();
            userInfoDeferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });
    });

    describe('onDateChanged', function() {
        it('should delegate dates to dateUtil for transformation', function() {
            controller.onDateChanged(fakeDate, fakeDate);
            expect(dateUtilMock.formatDateFromTimestamp).toHaveBeenCalledWith(fakeDate);
            expect(dateUtilMock.formatDateFromTimestamp.calls.count()).toBe(2);
        });

        it('should store from and to dates with start and end time', function() {
            controller.fromDate = undefined;
            controller.toDate = undefined;

            controller.onDateChanged(fakeDate, fakeDate);

            expect(controller.fromDate).toBe(fakeDate);
            expect(controller.toDate).toBe(fakeDate);
        });
    });

    describe('generateBill', function() {
        beforeEach(function() {
            controller.fromDate = fakeDate;
            controller.toDate = fakeDate;
            spyOn(controller, 'getKeystoneIdForUser').and.returnValue(userInfoPromise);
            spyOn(controller, 'getInternalBillItems').and.returnValue(billDetailsPromise);
            spyOn(controller, 'getExternalBillItems').and.returnValue(externalBillDetailsPromise);
            spyOn(controller, 'loadExternalUserIds').and.returnValue(externalIdsPromise);
            spyOn(controller, 'generateBillPDF').and.returnValue(billPromise);
            spyOn(controller, 'showPdfModal');
        });

        it('should show error if no dates are selected', function() {
            controller.fromDate = undefined;
            controller.toDate = undefined;

            controller.generateBill(fakeUser);

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });

        it('should correctly call getKeystoneIdForUser if dates are selected', function() {
            controller.generateBill(fakeUser);

            expect(controller.getKeystoneIdForUser)
                .toHaveBeenCalledWith(fakeUser, fakeSessionId);
        });

        it('should call loadExternalUserIds on first deferred.resolve', function() {
            controller.generateBill(fakeUser);

            userInfoDeferred.resolve(fakePromiseResult);
            $scope.$apply();

            expect(controller.loadExternalUserIds).toHaveBeenCalledWith(fakePromiseResult);
        });

        it('should call getExternalBillItems on second deferred.resolve', function() {
            controller.generateBill(fakeUser);

            userInfoDeferred.resolve(fakePromiseResult);
            externalIdsDeferred.resolve(fakePromiseResult);
            $scope.$apply();

            expect(controller.getExternalBillItems).toHaveBeenCalledWith(fakePromiseResult);
        });

        it('should call getInternalBillItems on third deferred.resolve', function() {
            controller.generateBill(fakeUser);

            userInfoDeferred.resolve(fakePromiseResult);
            externalIdsDeferred.resolve(fakePromiseResult);
            externalBillDetailsDeferred.resolve(fakePromiseResult);
            $scope.$apply();

            expect(controller.getInternalBillItems).toHaveBeenCalledWith(fakePromiseResult);
        });

        it('should call generateBillPDF on fourth deferred.resolve', function() {
            controller.generateBill(fakeUser);

            userInfoDeferred.resolve(fakePromiseResult);
            externalIdsDeferred.resolve(fakePromiseResult);
            externalBillDetailsDeferred.resolve(fakePromiseResult);
            billDetailsDeferred.resolve(fakePromiseResult);
            $scope.$apply();

            expect(controller.generateBillPDF).toHaveBeenCalledWith(fakePromiseResult);
        });

        it('should display success message on fifth deferred.resolve', function() {
            controller.generateBill(fakeUser);

            userInfoDeferred.resolve(fakePromiseResult);
            externalIdsDeferred.resolve(fakePromiseResult);
            externalBillDetailsDeferred.resolve(fakePromiseResult);
            billDetailsDeferred.resolve(fakePromiseResult);
            billDeferred.resolve(fakePromiseResult);
            $scope.$apply();

            expect(alertServiceMock.showSuccess).toHaveBeenCalled();
        });

        it('should display PDF modal on fifth deferred.resolve', function() {
            controller.generateBill(fakeUser);

            userInfoDeferred.resolve(fakePromiseResult);
            externalIdsDeferred.resolve(fakePromiseResult);
            externalBillDetailsDeferred.resolve(fakePromiseResult);
            billDetailsDeferred.resolve(fakePromiseResult);
            billDeferred.resolve(fakePromiseResult);
            $scope.$apply();

            expect(controller.showPdfModal).toHaveBeenCalled();
        });

        it('should execute error callback on deferred.reject', function() {
            controller.generateBill(fakeUser);

            userInfoDeferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });
    });

    describe('getKeystoneIdForUser', function() {
        it('should correclty call restService.getUserInfo', function() {
            controller.getKeystoneIdForUser(fakeUser, fakeSessionId);
            expect(restServiceMock.getUserInfo).toHaveBeenCalledWith(fakeUser, fakeSessionId);
        });

        it('should resolve the deferred if userId available', function() {
            var promise = controller.getKeystoneIdForUser(fakeUser, fakeSessionId);

            userInfoDeferred.resolve(fakeUserInfoResponse);
            $scope.$apply();

            expect(promise.$$state.status).toBe(1);
        });

        it('should reject the deferred if no userId available', function() {
            var promise = controller.getKeystoneIdForUser(fakeUser, fakeSessionId);

            userInfoDeferred.resolve(fakeUserInfoResponseNoId);
            $scope.$apply();

            expect(promise.$$state.status).toBe(2);
        });

        it('should reject the deferred if rest call fails', function() {
            var promise = controller.getKeystoneIdForUser(fakeUser, fakeSessionId);

            userInfoDeferred.reject();
            $scope.$apply();

            expect(promise.$$state.status).toBe(2);
        });
    });

    describe('getInternalBillItems', function() {
        it('should correclty call restService.getBillingInformation', function() {
            controller.getInternalBillItems(fakePromiseResult);
            expect(restServiceMock.getBillingInformation)
                .toHaveBeenCalledWith(fakeKeystoneId, fakeFromDateTime, fakeToDateTime);
        });

        it('should resolve the deferred if rest call is successful', function() {
            var promise = controller.getInternalBillItems(fakePromiseResult);

            billDetailsDeferred.resolve(fakeUserInfoResponse);
            $scope.$apply();

            expect(promise.$$state.status).toBe(1);
        });

        it('should reject the deferred if rest call fails', function() {
            var promise = controller.getInternalBillItems(fakePromiseResult);

            billDetailsDeferred.reject();
            $scope.$apply();

            expect(promise.$$state.status).toBe(2);
        });
    });

    describe('getExternalBillItems', function() {
        it('should correclty call restService.getBillingInformation', function() {
            controller.getExternalBillItems(fakePromiseResult);

            expect(restServiceMock.getBillingInformation)
                .toHaveBeenCalledWith(fakeExternalUserIds[0].userId, fakeFromDateTime, fakeToDateTime);
            expect(restServiceMock.getBillingInformation)
                .toHaveBeenCalledWith(fakeExternalUserIds[1].userId, fakeFromDateTime, fakeToDateTime);
        });

        it('should resolve the deferred if rest call is successful', function() {
            var promise = controller.getExternalBillItems(fakePromiseResult);

            billDetailsDeferred.resolve(fakeUserInfoResponse);
            $scope.$apply();

            expect(promise.$$state.status).toBe(1);
        });

        it('should call billDataService.setRawData for all external ID data', function() {
            var promise = controller.getExternalBillItems(fakePromiseResult);

            billDetailsDeferred.resolve(fakeUserInfoResponse);
            $scope.$apply();

            expect(billDataServiceMock.setRawData.calls.count()).toBe(fakeExternalUserIds.length);
        });

        it('should reject the deferred if rest call fails', function() {
            var promise = controller.getExternalBillItems(fakePromiseResult);

            billDetailsDeferred.reject();
            $scope.$apply();

            expect(promise.$$state.status).toBe(2);
        });
    });

    describe('generateBillPDF', function() {
        it('should correclty call restService.createBillPDF', function() {
            controller.generateBillPDF(fakePromiseResult);
            expect(restServiceMock.createBillPDF)
                .toHaveBeenCalledWith(fakePromiseResultWithDueDate);
        });

        it('should calculate due date', function() {
            controller.generateBillPDF(fakePromiseResult);
            expect(dateUtilMock.addDaysToDateString)
                .toHaveBeenCalledWith(fakeDate, 10);
        });

        it('should resolve the deferred if rest call is successful', function() {
            spyOn(window, 'Blob');
            var promise = controller.generateBillPDF(fakePromiseResult);

            billDeferred.resolve(fakeUserInfoResponse);
            $scope.$apply();

            expect(promise.$$state.status).toBe(1);
        });

        it('should reject the deferred if rest call fails', function() {
            var promise = controller.generateBillPDF(fakePromiseResult);

            billDeferred.reject();
            $scope.$apply();

            expect(promise.$$state.status).toBe(2);
        });
    });

    describe('showPdfModal', function() {
        it('should call $modal.open', function() {
            controller.showPdfModal();
            expect(modalMock.open).toHaveBeenCalled();
        });
    });

    describe('showUserBillsModal', function() {
        it('should call $modal.open', function() {
            controller.showUserBillsModal();
            expect(modalMock.open).toHaveBeenCalled();
        });
    });

    describe('showExistingBills', function() {
        beforeEach(function(){
            spyOn(controller, 'getKeystoneIdForUser').and.returnValue(userInfoPromise);
            spyOn(controller, 'getExistingBills').and.returnValue(billPromise);
            spyOn(controller, 'showUserBillsModal');
        });

        it('should correctly call getKeystoneIdForUser', function() {
            controller.showExistingBills(fakeUser);
            expect(sessionServiceMock.getSessionId).toHaveBeenCalled();
            expect(controller.getKeystoneIdForUser)
                .toHaveBeenCalledWith(fakeUser, fakeSessionId);
        });

        it('should correctly call getExistingBills on first deferred.resolve', function() {
            controller.showExistingBills(fakeUser);

            userInfoDeferred.resolve(fakePromiseResult);
            $scope.$digest();

            expect(controller.getExistingBills).toHaveBeenCalledWith(fakeKeystoneId);
        });

        it('should correctly call showUserBillsModal on second deferred.resolve', function() {
            controller.showExistingBills(fakeUser);

            userInfoDeferred.resolve(fakePromiseResult);
            billDeferred.resolve({});
            $scope.$digest();

            expect(controller.showUserBillsModal).toHaveBeenCalledWith({});
        });

        it('should execute error callback on deferred.reject', function() {
            controller.showExistingBills(fakeUser);

            userInfoDeferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });
    });
});
