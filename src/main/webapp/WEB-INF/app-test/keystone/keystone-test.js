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

describe('KeystoneController', function() {
    var $log;
    var $scope;
    var $location;
    var keystoneController;
    var authDeferred;
    var sessionDeferred;
    var authPromise;
    var sessionPromise;

    /*
        Fake Data
     */
    var fakeUser = "testuser";
    var fakePass = "fakepass";
    var fakeSessionId = "amo666";
    var fakeKeystoneId = "a1b2c3";
    var fakeResponse = {
        data: {
            keystoneId: fakeKeystoneId
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
        module('dashboard.keystone');

        /*
            Inject dependencies and configure mocks
         */
        inject(function($controller, $q, $rootScope, _$log_, _$location_) {
            $log = _$log_;
            $location = _$location_;
            $scope = $rootScope.$new();
            authDeferred = $q.defer();
            sessionDeferred = $q.defer();
            authPromise = authDeferred.promise;
            sessionPromise = sessionDeferred.promise;

            restServiceMock.sendKeystoneAuthRequest.and.returnValue(authPromise);
            restServiceMock.storeKeystoneId.and.returnValue(sessionPromise);
            sessionServiceMock.getUsername.and.returnValue(fakeUser);
            sessionServiceMock.getKeystoneId.and.returnValue(fakeKeystoneId);
            sessionServiceMock.getSessionId.and.returnValue(fakeSessionId);

            keystoneController = $controller('KeystoneController', {
                '$scope': $scope,
                'restService': restServiceMock,
                'sessionService': sessionServiceMock,
                'alertService': alertServiceMock
            });

            keystoneController.user = fakeUser;
            keystoneController.pwd = fakePass;
        });
    });

    /*
        Tests
     */
    describe('loadKeystoneId', function() {
        it('should correctly call restService.sendKeystoneAuthRequest', function() {
            keystoneController.loadKeystoneId();

            expect(restServiceMock.sendKeystoneAuthRequest)
                .toHaveBeenCalledWith(fakeUser, fakePass);
        });

        it('should execute keystoneAuthSuccess on authDeferred.resolve', function() {
            keystoneController.loadKeystoneId();
            authDeferred.resolve(fakeResponse);
            $scope.$digest();

            expect(sessionServiceMock.setKeystoneId)
                .toHaveBeenCalledWith(fakeResponse.data.keystoneId);
            expect(restServiceMock.storeKeystoneId)
                .toHaveBeenCalledWith(fakeUser, fakeKeystoneId, fakeSessionId);
        });

        it('should execute keystoneIdStored on sessionDeferred.resolve', function() {
            keystoneController.loadKeystoneId();
            authDeferred.resolve(fakeResponse);
            sessionDeferred.resolve();
            $scope.$digest();

            expect($location.url()).toBe("/overview");
        });

        it('should execute keystoneAuthFailed on authDeferred.reject', function() {
            keystoneController.loadKeystoneId();
            authDeferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });

        it('should execute keystoneAuthFailed on sessionDeferred.reject', function() {
            keystoneController.loadKeystoneId();
            authDeferred.resolve(fakeResponse);
            sessionDeferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });
    });
});
