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
    angular.module('dashboard.services')
        .service('restService', RestService);

    /*
     Controllers, Factories, Services, Directives
     */
    RestService.$inject = ['$http', 'sessionService'];
    function RestService($http, sessionService) {
        var me = this;

        this.getOAuthHeaderConfig = function () {
            return {
                headers: {
                    'X-OAuth-Token': sessionService.getAccessToken()
                }
            };
        };

        this.getUserId = function () {
            return {
                headers: {
                    'X-Auth-Uid': sessionService.getUserId()
                }
            };
        };

        /**
         * This method requests data from the UDR service via the dashboard
         * backend. Data is requested for a specified time period passed
         * in the request body.
         *
         * @param  {String} keystoneId The ID from the Keystone server
         * @param  {String} from Timestamp in the format "YYYY-MM-DD HH:MM:SS"
         * @param  {String} to Timestamp in the format "YYYY-MM-DD HH:MM:SS"
         * @return {Promise}
         */
        this.getUdrData = function (keystoneId, from, to) {
            var config = me.getOAuthHeaderConfig();
            var postData = {
                'keystoneId': keystoneId,
                'from': from,
                'to': to
            };

            return $http.post('/dashboard/rest/usage', postData, config);
        };

        /**
         * This method requests the Keystone ID for a given user from the
         * dashboard backend. Keystone credentials are passed in the request
         * body. Given a valid request, the Keystone ID is returned.
         *
         * @param  {String} username The Keystone username
         * @param  {String} password The Keystone password
         * @return {Promise}
         */
        this.sendKeystoneAuthRequest = function (username, password) {
            var postData = {
                'username': username,
                'password': password
            };

            return $http.post('/dashboard/rest/keystone', postData);
        };

        /**
         * This method sends an OpenAM login request to the dashboard backend.
         * User credentials are passed in the request body. Given a valid
         * request, an OAuth object with the Access Token is returned.
         *
         * @param  {String} username The OpenAM username
         * @param  {String} password The OpenAM password
         * @return {Promise}
         */
        this.sendLoginRequest = function (username, password) {
            var postData = {
                'username': username,
                'password': password
            };

            return $http.post('/dashboard/rest/login', postData);
        };

        /**
         * This method requests an OpenAM Session Token via the dashboard
         * backend. Given valid credentials, the session ID / cookie is
         * returned.
         *
         * @param  {String} username The OpenAM username
         * @param  {String} password The OpenAM password
         * @return {Promise}
         */
        this.requestSessionToken = function (username, password) {
            var postData = {
                'username': username,
                'password': password
            };

            return $http.post('/dashboard/rest/session', postData);
        };

        /**
         * This method stores the Keystone ID in the OpenAM user profile
         * via the dashboard backend. To successfully perform this action,
         * the user needs a valid OpenAM session ID.
         *
         * @param  {String} username The OpenAM username
         * @param  {String} keystoneId The OpenCloud Keystone ID
         * @param  {String} sessionId The OpenAM session ID / cookie
         * @return {Promise}
         */
        this.storeKeystoneId = function (username, keystoneId, sessionId) {
            var putData = {
                'username': username,
                'sessionId': sessionId,
                'keystoneId': keystoneId
            };
            return $http.put('/dashboard/rest/keystone', putData);
        };

        /**
         * This method requests additional token information from OpenAM via
         * the dashboard backend. The REST call requires a valid access token.
         *
         * @param  {String} accessToken The OAuth access token
         * @return {Promise}
         */
        this.getTokenInfo = function (accessToken) {
            var config = me.getUserId();
            var queryString = "?access_token=" + accessToken;
            return $http.get('/dashboard/rest/tokeninfo' + queryString, config);
        };

        /**
         * This method posts the meter selection from dashboard admins to
         * the UDR microservice via the dashboard backend.
         *
         * @param  {Object} Prepared request body
         * @return {Promise}
         */
        this.updateUdrMeters = function (requestBody) {
            var config = me.getOAuthHeaderConfig();
            return $http.post('/dashboard/rest/udrmeters', requestBody, config);
        };

        /**
         * This method requests the list of available meters from OpenStack
         * via the dashboard backend.
         *
         * @return {Promise}
         */
        this.getKeystoneMeters = function () {
            return $http.get('/dashboard/rest/keystonemeters');
        };

        /**
         * This method requests the list of selected meters from the UDR
         * microservice via the dashboard backend.
         *
         * @return {Promise}
         */
        this.getUdrMeters = function () {
            var config = me.getOAuthHeaderConfig();
            return $http.get('/dashboard/rest/udrmeters', config);
        };

        /**
         * This method reads the OpenAM Admin group via the dashboard backend
         * @param  {String} sessionId OpenAM Admin Session ID / Cookie
         * @return {Promise}
         */
        this.getAdminGroupInfo = function (sessionId) {
            var queryString = "?session_id=" + sessionId;
            return $http.get('/dashboard/rest/admins' + queryString);
        };

        /**
         * This method reads the OpenAM users via the dashboard backend
         * @param  {String} sessionId OpenAM Admin Session ID / Cookie
         * @return {Promise}
         */
        this.getUsers = function () {
            return $http.get('/dashboard/rest/users');
        };

        this.getAllUsers = function () {
            var queryString = "?all=1";
            return $http.get('/dashboard/rest/users' + queryString);
        };

        /**
         * This method gets the rate for a meter in a desired time frame
         * from the dashboard backend
         * @param  {String} meter Name of the desired meter
         * @param  {String} from Timestamp in the format "YYYY-MM-DD HH:MM:SS"
         * @param  {String} to Timestamp in the format "YYYY-MM-DD HH:MM:SS"
         * @return {Promise}
         */
        this.getRateForMeter = function (meter, from, to) {
            var config = me.getOAuthHeaderConfig();
            var query = "?resourcename=" + meter + "&from=" + from + "&to=" + to;
            return $http.get('/dashboard/rest/rate' + query, config);
        };

        /**
         * This method gets the charge for a use in a desired time frame
         * from the dashboard backend
         * @param  {String} userId Keystone User ID
         * @param  {String} from Timestamp in the format "YYYY-MM-DD HH:MM:SS"
         * @param  {String} to Timestamp in the format "YYYY-MM-DD HH:MM:SS"
         * @return {Promise}
         */
        this.getChargeForUser = function (userId, from, to) {
            var config = me.getOAuthHeaderConfig();
            var query = "?userid=" + userId + "&from=" + from + "&to=" + to;
            return $http.get('/dashboard/rest/charge' + query, config);
        };

        /**
         * This method gets the current rate policy from the RC microservice via
         * the dashboard backend
         * @return {Promise}
         */
        this.getActiveRatePolicy = function () {
            var config = me.getOAuthHeaderConfig();
            return $http.get('/dashboard/rest/rate/status', config);
        };

        /**
         * This method gets updates the rate policy on the RC microservice via
         * the dashboard backend
         * @param {Object} policyConfig New Policy Configuration
         * @return {Promise}
         */
        this.setActiveRatePolicy = function (policyConfig) {
            var config = me.getOAuthHeaderConfig();
            return $http.post('/dashboard/rest/rate/status', policyConfig, config);
        };

        /**
         * This method updates the admin group in OpenAM via the dashboard backend
         * @param  {Array} admins Array of Admin names
         * @param  {String} sessionId OpenAM Admin Session ID
         * @return {Promise}
         */
        /*this.updateAdmins = function(admins, sessionId) {
         var putData = {
         'admins': admins,
         'sessionId': sessionId
         };

         return $http.put('/dashboard/rest/admins', putData);
         };*/

        /**
         * This method updates the category of the user/admin
         * @param user
         * @param promotion
         * @returns {*}
         */
        this.updateUsers = function (user, promotion) {
            var putData = {
                'user': user,
                'promotion': promotion
            }
            return $http.put('/dashboard/rest/users', putData);
        }

        /**
         * This method loads user information from OpenAM via the dashboard backend
         * @param  {String} username Username whose details will be read
         * @param  {String} adminSessionId Admin Session ID from OpenAM
         * @return {Promise}
         */
        this.getUserInfo = function (username, adminSessionId) {
            return $http.get('/dashboard/rest/users/' + username + "?username=" + username);
        };

        /**
         * This method sends bill details to the dashboard backend for PDF generation
         * @param  {Object} billDetails Object containing billing details
         * @return {Promise}
         */
        this.createBillPDF = function (billDetails) {
            return $http.post('/dashboard/rest/billing/bills/pdf', billDetails, {responseType: 'arraybuffer'});
        };

        /**
         * This method gets the bill for a specific user and time period from
         * the dashboard backend
         * @param  {String} userId The user's cloud provider ID
         * @param  {String} from YYYY-MM-DD timestamp
         * @param  {String} to YYYY-MM-DD timestamp
         * @return {Promise}
         */
        this.getBillPDF = function (userId, from, to) {
            var queryString = "?user_id=" + userId + "&from=" + from + "&to=" + to;
            return $http.get('/dashboard/rest/billing/bills/pdf' + queryString, {responseType: 'arraybuffer'});
        };

        /**
         * This method gets information about alle the user's bills from the
         * dashboard backend
         * @param  {String} userId Object The user's cloud provider ID
         * @return {Promise}
         */
        this.getBills = function (userId, all) {
            return $http.get('/dashboard/rest/billing/bills?user_id=' + userId + '&a=' + all);
        };

        /**
         * This method gets detailed billing information for a user during a
         * specified time window
         * @param  {String} userId User ID
         * @param  {String} from YYYY-MM-DD timestamp
         * @param  {String} to YYYY-MM-DD timestamp
         * @return {Promise}
         */
        this.getBillingInformation = function (userId, from, to) {
            var config = me.getOAuthHeaderConfig();
            var queryString = "?userid=" + userId + "&from=" + from + "&to=" + to;
            return $http.get('/dashboard/rest/billing' + queryString, config);
        };

        /**
         * a
         * @param  {String} userId User ID for which data should be loaded
         * @return {Promise}
         */
        this.getExternalUserIds = function (userId) {
            return $http.get('/dashboard/rest/udrmeters/externalids?user_id=' + userId);
        };

        /**
         * a
         * @param  {String} userId User ID for which data should be stored
         * @param  {Array} externalIds Array of external IDs to store
         * @return {Promise}
         */
        this.updateExternalUserIds = function (userId, externalIds) {
            return $http.post('/dashboard/rest/udrmeters/externalids', {
                userId: userId,
                externalIds: externalIds
            });
        };

        /**
         * a
         * @param  {String} meterSource Name of the meter source to be stored
         * @return {Promise}
         */
        this.addExternalMeterSource = function (meterSource) {
            return $http.post('/dashboard/rest/udrmeters/externalsources', {
                source: meterSource
            });
        };

        /**
         * This method tries to put into the database the information of a
         * new registered user.
         * @param {String} user the chosen username from the new user.
         * @param {String} pwd password to access to the dashboard
         * @param {String} realName name of the user
         * @param {String} surname surname of the user
         * @param {String} email user's email
         * @return {Promise}
         */
        this.sendRegister = function (user, pwd, realName, surname, email, admin) {
            var data = {
                'username': user,
                'password': pwd,
                'name': realName,
                'surname': surname,
                'email': email,
                'admin': admin
            };
            return $http.put('/dashboard/rest/registration', data);
        };

        this.updateBillStatus = function (userId, from, to, approved, paid) {
            var queryString = "?user_id=" + userId + "&from=" + from + "&to=" + to + "&a=" + approved + "&p=" + paid;
            return $http.post('/dashboard/rest/billing/bills' + queryString, {responseType: 'arraybuffer'});
        };
    }

})();
