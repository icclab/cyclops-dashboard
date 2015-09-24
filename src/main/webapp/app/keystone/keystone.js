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

(function () {
    /*
     Module Setup
     */
    angular.module('dashboard.keystone')
        .controller('KeystoneController', KeystoneController);

    /*
     Controllers, Factories, Services, Directives
     */
    KeystoneController.$inject =
        ['$log', '$location', 'restService', 'sessionService', 'alertService'];
    function KeystoneController($log, $location, restService, sessionService, alertService) {
        var me = this;
        this.user = '';
        this.pwd = '';

        var keystoneIdStored = function () {
            $location.path("/overview");
        };

        var keystoneAuthSuccess = function (response) {
            sessionService.setKeystoneId(response.data.keystoneId);
            alertService.showSuccess("Login succeed.");
            return restService.storeKeystoneId(
                sessionService.getUsername(),
                sessionService.getKeystoneId(),
                sessionService.getSessionId()
            );
        };

        var keystoneAuthFailed = function () {
            alertService.showError("Login failed. Please verify your credentials");
        };

        this.loadKeystoneId = function () {
            restService.sendKeystoneAuthRequest(me.user, me.pwd)
                .then(keystoneAuthSuccess)
                .then(keystoneIdStored, keystoneAuthFailed);
        };
    };

})();
