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

describe('AdminUserController', function() {
    var controller;
    var userDeferred;
    var adminDeferred;
    var userPromise;
    var adminPromise;

    /*
        Fake Data
     */
    var fakeUser = "test";
    var fakeAdmin = "AdminA";
    var fakeSessionId = "123abc";
    var fakeUserResponseData = {
        result: "bla"
    };
    var fakeAdminResponseData = {
        uniqueMember: "bla"
    };
    var fakeUserResponse = {
        data: fakeUserResponseData
    };
    var fakeAdminResponse = {
        data: fakeAdminResponseData
    };
    var fakeUserList = ["UserA", "AdminA"];
    var fakeNormalUsers = ["UserA"];
    var fakeAdmins = [ fakeAdmin ];
    var fakeAdminsAfterPromotion = [fakeAdmin, fakeUser];
    var fakeAdminsAfterDemotion = [];
    /*
        Test setup
     */
    beforeEach(function(){
        resetAllMocks();

        /*
            Load module
         */
        module('dashboard.admin.users');

        /*
            Inject dependencies and configure mocks
         */
        inject(function($controller, $q, $rootScope, _$log_) {
            $scope = $rootScope.$new();
            $log = _$log_;
            userDeferred = $q.defer();
            adminDeferred = $q.defer();
            userPromise = userDeferred.promise;
            adminPromise = adminDeferred.promise;

            sessionServiceMock.getSessionId.and.returnValue(fakeSessionId);
            restServiceMock.getUsers.and.returnValue(userPromise);
            restServiceMock.getAdminGroupInfo.and.returnValue(adminPromise);
            restServiceMock.updateAdmins.and.returnValue(adminPromise);
            responseParserMock.getUserListFromResponse.and.returnValue(fakeUserList);
            responseParserMock.getAdminListFromResponse.and.returnValue(fakeAdmins);

            controller = $controller('AdminUserController', {
                '$scope': $scope,
                'sessionService': sessionServiceMock,
                'restService': restServiceMock,
                'alertService': alertServiceMock,
                'responseParser': responseParserMock
            });
        });
    });

    /*
        Tests
     */
    describe('getUsers', function() {
        it('should correctly call restService.getUsers', function() {
            controller.getUsers();

            expect(sessionServiceMock.getSessionId).toHaveBeenCalled();
            expect(restServiceMock.getUsers)
                .toHaveBeenCalledWith(fakeSessionId);
        });

        it('should execute onUsersLoadSuccess on userDeferred.resolve', function() {
            controller.getUsers();
            userDeferred.resolve(fakeUserResponse);
            $scope.$digest();

            expect(responseParserMock.getUserListFromResponse)
                .toHaveBeenCalledWith(fakeUserResponseData);
        });

        it('should execute onAdminsLoadSuccess on adminDeferred.resolve', function() {
            controller.getUsers();
            userDeferred.resolve(fakeUserResponse);
            adminDeferred.resolve(fakeAdminResponse);
            $scope.$digest();

            expect(responseParserMock.getUserListFromResponse)
                .toHaveBeenCalledWith(fakeUserResponseData);
            expect(responseParserMock.getAdminListFromResponse)
                .toHaveBeenCalledWith(fakeAdminResponseData);
        });

        it('should execute onLoadError on userDeferred.reject', function() {
            controller.getUsers();
            userDeferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();

        });

        it('should execute onLoadError on adminDeferred.reject', function() {
            controller.getUsers();
            userDeferred.resolve(fakeUserResponse);
            adminDeferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });
    });

    describe('updateAdmins', function() {
        it('should correctly call restService.updateAdmins', function() {
            controller.admins = fakeAdmins;

            controller.updateAdmins(fakeAdmins);

            expect(sessionServiceMock.getSessionId).toHaveBeenCalled();
            expect(restServiceMock.updateAdmins)
                .toHaveBeenCalledWith(fakeAdmins, fakeSessionId);
        });

        it('should execute success callback on adminDeferred.resolve', function() {
            controller.updateAdmins();
            adminDeferred.resolve(fakeAdminResponse);
            $scope.$digest();

            expect(responseParserMock.getAdminListFromResponse)
                .toHaveBeenCalledWith(fakeAdminResponseData);
            expect(alertServiceMock.showSuccess).toHaveBeenCalled();
        });

        it('should execute error callback on adminDeferred.reject', function() {
            controller.updateAdmins();
            adminDeferred.reject();
            $scope.$digest();

            expect(alertServiceMock.showError).toHaveBeenCalled();
        });
    });

    describe('promoteUser', function() {
        it('should call updateAdmins with promoted user', function() {
            spyOn(controller, 'updateAdmins');
            controller.admins = fakeAdmins;

            controller.promoteUser(fakeUser);

            expect(controller.updateAdmins)
                .toHaveBeenCalledWith(fakeAdminsAfterPromotion);
        });
    });

    describe('demoteUser', function() {
        it('should call updateAdmins with promoted user', function() {
            spyOn(controller, 'updateAdmins');
            controller.admins = fakeAdmins;

            controller.demoteUser(fakeAdmin);

            expect(controller.updateAdmins)
                .toHaveBeenCalledWith(fakeAdminsAfterDemotion);
        });
    });
});
