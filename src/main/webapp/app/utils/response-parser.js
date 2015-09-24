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

(function() {
    /*
        Module Setup
    */
    angular.module('dashboard.utils')
        .service('responseParser', ResponseParser);

    /*
        Controllers, Factories, Services, Directives
    */
    function ResponseParser() {

        this.getStaticRatingListFromResponse = function (responseData) {
            var rates = responseData.rate || {};
            var staticRatingList = {};

            for (var meterName in rates) {
                var rate = rates[meterName];
                staticRatingList[meterName] = {
                    'name': meterName,
                    'rate': rate
                };
            }

            return staticRatingList;
        };

        /*this.getAdminListFromResponse = function (responseData) {
            var userStrings = responseData.uniqueMember || [];
            var userList = [];

            for (var i = 0; i < userStrings.length; i++) {
                var re = /uid=(.*?),/g;
                var matched = re.exec(userStrings[i]);

                if (matched && matched[1]) {
                    userList.push(matched[1]);
                }
            }

            return userList;
        };*/

        this.getUserListFromResponse = function (responseData) {
            return responseData || [];
        };



        //We use a new method as now the json response and the requirements have changed
        //
        //this.getAdminStatusFromResponse = function(responseData) {
        //    var groups = responseData.isMemberOf || "";
        //
        //    if(groups instanceof Array) {
        //        groups = groups.join();
        //    }
        //
        //    return /cn=CyclopsAdmin/g.test(groups);
        //};
        this.getAdminStatusFromResponse = function(responseData) {
            return responseData;
        }

        this.fetchUsersAndAdmins = function(users,admins){
            var userList = [];
            for (var i = 0; i<users.length;i++){
                userList[i] = users[i];
            }
            var l = userList.length;
            for (var o = 0; o<admins.length; o++){
                userList[l+o] = admins[o];
            }
            return userList;
        }
    }

})();
