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
    angular.module('dashboard.services')
        .service('sessionService', SessionService);

    /*
        Controllers, Factories, Services, Directives
    */
    function SessionService() {

        var set = function(key, value) {
            sessionStorage[key] = value;
        };

        var get = function(key) {
            return sessionStorage[key];
        };

        this.clearSession = function() {
            sessionStorage.clear();
        };

        this.getSessionId = function() {
            return get('sessionId');
        };

        this.getAccessToken = function() {
            return get('accessToken');
        };

        this.getIdToken = function() {
            return get('idToken');
        };

        this.getUsername = function() {
            return get('username');
        };

        this.getTokenType = function() {
            return get('tokenType');
        };

        this.getExpiration = function() {
            return get('expires');
        };

        this.getKeystoneId = function() {
            return get('keystoneId');
        };

        this.getUserId = function(){
            return get('userId');
        };

        this.getExternalIds = function() {
            return angular.fromJson(get('externalIds'));
        };

        this.setUserId = function(id){
            set('userId', id);
        };

        this.setExternalIds = function(ids) {
            return set('externalIds', angular.toJson(ids));
        };

        this.setSessionId = function(id) {
            set('sessionId', id);
        };

        this.setAccessToken = function(token) {
            set('accessToken', token);
        };

        this.setIdToken = function(token) {
            set('idToken', token);
        };

        this.setUsername = function(name) {
            set('username', name);
        };

        this.setTokenType = function(type) {
            set('tokenType', type);
        };

        this.setExpiration = function(exp) {
            set('expires', exp);
        };

        this.setKeystoneId = function(id) {
            set('keystoneId', id);
        };

        this.setAdmin = function(isAdmin) {
            set('admin', isAdmin);
        };

        this.isAdmin = function() {
            return get('admin') == "true";
        };

        this.isAuthenticated = function() {
            var token = get('accessToken');
            return token && token.length > 0;
        };
    }

})();
