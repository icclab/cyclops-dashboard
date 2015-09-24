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
    angular.module('dashboard.login')
        .controller('LoginController', LoginController);

    /*
        Controllers, Factories, Services, Directives
    */
    LoginController.$inject = [
        '$location', 'sessionService', 'restService', 'alertService', 'responseParser'
    ];
    function LoginController(
            $location, sessionService, restService, alertService, responseParser) {
        var me = this;
        this.user = '';
        this.pwd = '';

        /**
         * This method redirects to the overview page.
         */
        this.showOverview = function(response) {
            $location.path("/overview");
        };

        /**
         * Private callback function. Will be called after the tokenInfo
         * request succeeds. The method will store the Keystone ID and the
         * admin status in the user session
         */
        var tokenInfoSuccess = function(response) {
            var responseData = response.data;
            sessionService.setKeystoneId(responseData.keystoneId);
            sessionService.setAdmin(responseData.admin);
            return restService.requestSessionToken(me.user, me.pwd);
        };

        /**
         * Private callback function. Will be called after the sessionInfo
         * request succeeds. The method will store the Session ID in the
         * user session
         */
        var sessionInfoSuccess = function(response) {
            sessionService.setSessionId(response.data.tokenId);
            me.showOverview();
        };

        /**
         * Private callback function. Will be called after the login request
         * succeeds. The method will store username and tokens in the session
         * and issue another request via the restService.
         *
        var loginSuccess = function(response) {
            var responseData = response.data;
            var accessToken = responseData.access_token;
            sessionService.setUsername(me.user);
            sessionService.setAccessToken(accessToken);
            sessionService.setIdToken(responseData.id_token);
            alertService.showSuccess("You have successfully been logged in.");
            return restService.getTokenInfo(accessToken);
        };

        /**
         * Private callback function. Will be called if the login fails.
         */
        var loginFailed = function() {
            alertService.showError(
                "Username or password is invalid. Please try again"
            );
        };

        /**
         * Private callback function. Will be called if the login succeeds.
         */
        var loginSuccess = function (response) {
            var responseData = response.data;
            var accessToken = responseData.access_token;
            sessionService.setUsername(me.user);
            sessionService.setAccessToken(accessToken);
            sessionService.setIdToken(accessToken);
            sessionService.setUserId(responseData.userId);
            alertService.showSuccess("You have successfully been logged in.");
            return restService.getTokenInfo(accessToken);//Aqui llama al restservice y se manda una peticion a una uri que parece no existir
        };

        /**
         * This method delegates the login to the rest service. If the provided
         * credentials are valid, additional token info will be requested from
         * the REST service.
         *
         * @param  {String} username The dashboard username
         * @param  {String} password The dashboard password
         */

        /*this.login = function() {
            restService.sendLoginRequest(me.user, me.pwd)
                .then(loginSuccess)
                .then(tokenInfoSuccess)
                .then(sessionInfoSuccess, loginFailed);
        };*/

        /**
         * This method delegates the login to the rest service. If the provided
         * credentials are valid, additional token info will be requested from
         * the REST service.
         *
         * @author Manu
         *
         */
        this.login = function(){
            restService.sendLoginRequest(me.user, me.pwd)
                .then(redirect);
        };

	   var redirect = function(response){
           var responseData = response.data;
           if(responseData.loginInfo=="success"){
               loginSuccess(response);
               tokenInfoSuccess(response);
               sessionInfoSuccess(response);
           }else{
               loginFailed();
           }
	   };

    };

})();
