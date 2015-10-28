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

describe('LoginController', function() {
    var $scope;
    var $location;
    var controller;
    var loginDeferred;
    var tokenDeferred;
    var sessionDeferred;
    var loginPromise;
    var tokenPromise;
    var sessionPromise;

    /*
        Fake Data
     */
    var fakeUser = "testuser";
    var fakePass = "testpass";
    var fakeLoginResponse = {
        data: {
            'access_token': 'abc',
            'id_token': '123'
        }
    };
    var fakeTokenResponse = {
        data: {
            'keystoneid': '1a2b3c'
        }
    };
    var fakeSessionResponse = {
        data: {
            'tokenId': "5s5s5s"
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
        module('dashboard.login');

        /*
            Inject dependencies and configure mocks
         */
        inject(function($controller, $q, $rootScope, _$location_) {
            $location = _$location_;
            $scope = $rootScope.$new();
            loginDeferred = $q.defer();
            tokenDeferred = $q.defer();
            sessionDeferred = $q.defer();
            loginPromise = loginDeferred.promise;
            tokenPromise = tokenDeferred.promise;
            sessionPromise = sessionDeferred.promise;

            restServiceMock.sendLoginRequest.and.returnValue(loginPromise);
            restServiceMock.getTokenInfo.and.returnValue(tokenPromise);
            restServiceMock.requestSessionToken.and.returnValue(sessionPromise);
            responseParserMock.getAdminStatusFromResponse.and.returnValue(true);

            controller = $controller('LoginController', {
                '$scope': $scope,
                'restService': restServiceMock,
                'sessionService': sessionServiceMock,
                'alertService': alertServiceMock,
                'responseParser': responseParserMock
            });

            controller.user = fakeUser;
            controller.pwd = fakePass;
        });
    });

    /*
        Tests
     */
    describe('login', function() {
        it('should correctly call restService.sendLoginRequest', function() {
            controller.login();

            expect(restServiceMock.sendLoginRequest)
                .toHaveBeenCalled();
        });

        it('should correctly call restService.getTokenInfo', function() {
            controller.login();
            loginDeferred.resolve(fakeLoginResponse);
            $scope.$digest();

            expect(restServiceMock.getTokenInfo)
                .toHaveBeenCalledWith(fakeLoginResponse.data.access_token);
        });

        it('should execute loginSuccess on loginDeferred.resolve', function() {
            controller.login();
            loginDeferred.resolve(fakeLoginResponse);
            $scope.$digest();

            expect(sessionServiceMock.setUsername)
                .toHaveBeenCalledWith(fakeUser);
            expect(sessionServiceMock.setAccessToken)
                .toHaveBeenCalledWith(fakeLoginResponse.data.access_token);
            expect(sessionServiceMock.setIdToken)
                .toHaveBeenCalledWith(fakeLoginResponse.data.id_token);
            expect(restServiceMock.getTokenInfo)
                .toHaveBeenCalledWith(fakeLoginResponse.data.access_token);
        });

        it('should execute tokenInfoSuccess on tokenInfoDeferred.resolve', function() {
            controller.login();
            loginDeferred.resolve(fakeLoginResponse);
            tokenDeferred.resolve(fakeTokenResponse);
            $scope.$digest();

            expect(sessionServiceMock.setKeystoneId)
                .toHaveBeenCalledWith(fakeTokenResponse.data.keystoneid);
            expect(restServiceMock.requestSessionToken)
                .toHaveBeenCalledWith(fakeUser, fakePass);
            expect(responseParserMock.getAdminStatusFromResponse)
                .toHaveBeenCalledWith(fakeTokenResponse.data);
            expect(sessionServiceMock.setAdmin).toHaveBeenCalledWith(true);
        });

        it('should execute sessionInfoSuccess on sessionInfoDeferred.resolve', function() {
            spyOn(controller, 'showOverview');
            controller.login();
            loginDeferred.resolve(fakeLoginResponse);
            tokenDeferred.resolve(fakeTokenResponse);
            sessionDeferred.resolve(fakeSessionResponse);
            $scope.$digest();

            expect(sessionServiceMock.setKeystoneId)
                .toHaveBeenCalledWith(fakeTokenResponse.data.keystoneid);
            expect(controller.showOverview).toHaveBeenCalled();
        });

        it('should execute loginFailed on loginDeferred.reject', function() {
            controller.login();
            loginDeferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });

        it('should execute loginFailed on tokenDeferred.reject', function() {
            controller.login();
            loginDeferred.resolve(fakeLoginResponse);
            tokenDeferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });

        it('should execute loginFailed on sessionDeferred.reject', function() {
            controller.login();
            loginDeferred.resolve(fakeLoginResponse);
            tokenDeferred.resolve(fakeTokenResponse);
            sessionDeferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });
    });

    describe('showOverview', function() {
        it('should redirect to /overview', function() {
            controller.showOverview();
            expect($location.url()).toBe('/overview');
        });
    });

});
