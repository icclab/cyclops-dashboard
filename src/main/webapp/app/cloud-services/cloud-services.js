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

(function(){
    /*
        Module Setup
    */
    angular.module('dashboard.cloudservices')
        .controller('CloudServiceController', CloudServiceController);

    /*
        Controllers, Factories, Services, Directives
    */
    CloudServiceController.$inject = ['$state', 'restService', 'sessionService', 'alertService'];
    function CloudServiceController($state, restService, sessionService, alertService) {
        var me = this;
        this.externalUserIds = [];

        var onUpdateIdsSuccess = function(response) {
            alertService.showSuccess("IDs successfully updated");
        };

        var onUpdateIdsError = function() {
            alertService.showError("Could not save external IDs");
        };

        var onLoadIdsSuccess = function(response) {
            me.externalUserIds = response.data;
        };

        var onLoadIdsError = function() {
            alertService.showError("Could not load external user IDs");
        };

        this.showKeystone = function() {
            $state.go("keystone");
        };

        this.updateExternalUserIds = function() {
            var userId = sessionService.getKeystoneId();
            restService.updateExternalUserIds(userId, me.externalUserIds)
                .then(onUpdateIdsSuccess, onUpdateIdsError);
        };

        this.loadExternalUserIds = function() {
            var userId = sessionService.getKeystoneId();
            restService.getExternalUserIds(userId)
                .then(onLoadIdsSuccess, onLoadIdsError);
        };

        this.hasExternalUserIds = function() {
            return me.externalUserIds.length > 0;
        };

        this.loadExternalUserIds();
    };

})();
