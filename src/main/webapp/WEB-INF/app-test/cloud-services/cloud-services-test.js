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

describe('CloudServiceController', function() {
    var $scope;
    var $location;
    var controller;
    var deferred;
    var promise;

    /*
        Fake Data
     */
    var fakeKeystoneId = "123abc";

    /*
        Test setup
     */
    beforeEach(function() {
        resetAllMocks();

        /*
            Load module
         */
        module('dashboard.cloudservices');

        /*
            Inject dependencies and configure mocks
         */
        inject(function($controller, $q, $rootScope, _$location_) {
            $location = _$location_;
            $scope = $rootScope.$new();
            deferred = $q.defer();
            promise = deferred.promise;

            sessionServiceMock.getKeystoneId.and.returnValue(fakeKeystoneId);
            restServiceMock.updateExternalUserIds.and.returnValue(promise);
            restServiceMock.getExternalUserIds.and.returnValue(promise);

            controller = $controller('CloudServiceController', {
                '$scope': $scope,
                '$state': stateMock,
                'restService': restServiceMock,
                'sessionService': sessionServiceMock,
                'alertService': alertServiceMock
            });
        });
    });

    /*
        Tests
     */
    describe('updateExternalUserIds', function() {
        it('should read the User ID from the session', function() {
            controller.updateExternalUserIds();
            expect(sessionServiceMock.getKeystoneId).toHaveBeenCalled();
        });

        it('should correctly call restService.updateExternalUserIds', function() {
            controller.externalUserIds = [1];
            controller.updateExternalUserIds();
            expect(restServiceMock.updateExternalUserIds)
                .toHaveBeenCalledWith(fakeKeystoneId, [1]);
        });

        it('should execute success callback on deferred.resolve', function() {
            controller.updateExternalUserIds();

            deferred.resolve({});
            $scope.$digest();

            expect(alertServiceMock.showSuccess).toHaveBeenCalled();
        });

        it('should execute error callback on deferred.reject', function() {
            controller.updateExternalUserIds();

            deferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
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
            controller.loadExternalUserIds();

            deferred.resolve({ data: [1] });
            $scope.$digest();

            expect(controller.externalUserIds).toEqual([1]);
        });

        it('should execute error callback on deferred.reject', function() {
            controller.loadExternalUserIds();

            deferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });
    });

    describe('hasExternalUserIds', function() {
        it('should return true if there are external IDs', function() {
            controller.externalUserIds = [1];
            expect(controller.hasExternalUserIds()).toBeTruthy();
        });

        it('should return false if there are no external IDs', function() {
            controller.externalUserIds = [];
            expect(controller.hasExternalUserIds()).toBeFalsy();
        });
    });

    describe('showKeystone', function() {
        it('should switch the state', function() {
            controller.showKeystone();
            expect(stateMock.go).toHaveBeenCalledWith('keystone');
        });
    });
});
