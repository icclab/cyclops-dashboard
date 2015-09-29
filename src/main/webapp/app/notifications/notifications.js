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
    angular.module('dashboard.notifications')
        .controller('NotificationController', NotificationController);

    /*
        Controllers, Factories, Services, Directives
    */
    NotificationController.$inject = ['$scope', 'restService'];
    function NotificationController($scope, restService) {
        var me = this;

        /**
         * Objects in the following form:
         *
         * {
         *     text: "notification_text",
         *     time: "time_of_notification"
         * }
         *
         * @type {Array}
         */
        this.notifications = [
            {text: "UDR Service: Running", time: "1 minute ago"},
            {text: "RC Service: Running", time: "1 minute ago"},
            {text: "CDR Service: Running", time: "1 minute ago"}
        ];
    };

})();
