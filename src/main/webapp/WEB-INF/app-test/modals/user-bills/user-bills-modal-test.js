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

describe('UserBillsModalController', function() {
    var $scope;
    var controller;

    /*
        Fake Data
     */

    /*
        Test setup
     */
    beforeEach(function() {
        resetAllMocks();

        /*
            Load module
         */
        module('dashboard.modals');

        /*
            Inject dependencies and configure mocks
         */
        inject(function($controller, $q, $rootScope) {
            $scope = $rootScope.$new();

            controller = $controller('UserBillsModalController', {
                '$scope': $scope,
                '$modalInstance': modalMock,
                'bills': {}
            });
        });
    });

    /*
        Tests
     */
    describe('close', function() {
        it('should close the modal instance', function() {
            controller.close();
            expect(modalMock.close).toHaveBeenCalled();
        });
    });
});
