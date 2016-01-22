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
    angular.module('dashboard.cloudstack')
        .controller('CloudstackController', CloudstackController);

    /*
     Controllers, Factories, Services, Directives
     */
    CloudstackController.$inject =
        ['$log', '$location', 'restService', 'sessionService', 'alertService'];
    function CloudstackController($log, $location, restService, sessionService, alertService) {
        var me = this;
        this.user = '';

        var cloudstackIdStored = function () {
            $location.path("/overview");
        };

        //TODO: change the syntax of the variables in the whole workflow.
        this.loadUsername = function () {
            sessionService.setKeystoneId(me.user);
            alertService.showSuccess("Login succeed.");
            return restService.storeCloudstackId(
                sessionService.getUsername(),
                sessionService.getKeystoneId()
            )
                .then(cloudstackIdStored);
        }
    };

})();
