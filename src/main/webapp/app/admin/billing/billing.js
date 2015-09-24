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
    angular.module('dashboard.admin.billing')
        .controller('AdminBillingController', AdminBillingController);

    /*
     Controllers, Factories, Services, Directives
     */
    AdminBillingController.$inject = [
        '$q', '$sce', '$modal', 'sessionService', 'restService', 'billDataService',
        'alertService', 'responseParser', 'dateUtil'
    ];
    function AdminBillingController($q, $sce, $modal, sessionService, restService, billDataService,
                                    alertService, responseParser, dateUtil) {
        var me = this;
        this.users = [];
        this.dateFormat = "yyyy-MM-dd";
        this.defaultDate = dateUtil.getFormattedDateToday();
        this.fromDate = me.defaultDate;
        this.toDate = me.defaultDate;

        this.showPdfModal = function () {
            var modalInstance = $modal.open({
                templateUrl: 'modals/pdf/pdf-modal.html',
                controller: 'PdfModalController',
                controllerAs: 'pdfModalCtrl',
                size: 'lg',
                resolve: {
                    pdf: function () {
                        return me.pdf;
                    }
                }
            });
        };

        this.showUserBillsModal = function (bills) {
            var modalInstance = $modal.open({
                templateUrl: 'modals/user-bills/user-bills-modal.html',
                controller: 'UserBillsModalController',
                controllerAs: 'userBillsModalCtrl',
                size: 'lg',
                resolve: {
                    bills: function () {
                        return bills;
                    }
                }
            });
        };

        this.getKeystoneIdForUser = function (username) {
            var deferred = $q.defer();

            restService.getUserInfo(username).then(
                function (response) {
                    var responseData = response.data;
                    var keystoneIdField = responseData.keystoneId || [];
                    var firstNameField = responseData.name || [];
                    var lastNameField = responseData.surname || [];
                    var userId = responseData.userId || [];

                    //No need to continue processing if the user does not have
                    //a user ID. He can't have a bill anyway.
                    if (userId) {
                        deferred.resolve({
                            userId: keystoneIdField,//userId,
                            firstName: firstNameField[0] || "",
                            lastName: lastNameField[0] || "",
                            from: me.fromDate,
                            to: me.toDate
                        });
                    }
                    else {
                        deferred.reject("User does not have a cloud account assigned");
                    }
                },
                function () {
                    deferred.reject("Could not load user information");
                }
            );

            return deferred.promise;
        };

        this.loadExternalUserIds = function (params) {
            var deferred = $q.defer();

            var userId = sessionService.getKeystoneId();
            restService.getExternalUserIds(userId).then(
                function (response) {

                    //All loaded external IDs will be passed to the getExternalBillItems
                    //method for processing
                    params.externalUserIds = response.data;
                    deferred.resolve(params);
                },
                function () {
                    deferred.reject("Could not load external IDs");
                }
            );

            return deferred.promise;
        };

        this.getInternalBillItems = function (params) {
            var deferred = $q.defer();
            var from = params.from + " 00:00";
            var to = params.to + " 23:59";

            restService.getBillingInformation(params.userId, from, to).then(
                function (response) {
                    //Store the data for the internal billing items in the
                    //billDataService. The service should already contain
                    //external billing items.
                    billDataService.setRawData(response.data);
                    params.billItems = billDataService.getFormattedData();
                    deferred.resolve(params);
                },
                function () {
                    deferred.reject("Could not load charge data for user");
                }
            );

            return deferred.promise;
        };

        this.getExternalBillItems = function (params) {
            var deferred = $q.defer();
            var promises = [];
            var exIds = params.externalUserIds;
            var from = params.from + " 00:00";
            var to = params.to + " 23:59";

            for (var i = 0; i < exIds.length; i++) {

                //Only load data for external applications that have an ID associated
                if (exIds[i].userId && exIds[i].userId != "") {
                    var promise = restService.getBillingInformation(exIds[i].userId, from, to);
                    promises.push(promise);
                }
            }

            $q.all(promises).then(
                function (responses) {

                    //for each external meter that was loaded, store the data
                    //in the billDataService. The data will later be used after
                    //the internal billing items have been loaded.
                    for (var i = 0; i < responses.length; i++) {
                        var response = responses[i];
                        billDataService.setRawData(response.data);
                    }
                    ;

                    deferred.resolve(params);
                },
                function () {
                    deferred.reject("Could not load all external meter data");
                }
            );

            return deferred.promise;
        };

        this.generateBillPDF = function (params) {
            var deferred = $q.defer();
            params.due = dateUtil.addDaysToDateString(params.to, 10);

            restService.createBillPDF(params).then(
                function (response) {
                    //https://stackoverflow.com/questions/21628378/angularjs-display-blob-pdf-in-an-angular-app
                    var file = new Blob([response.data], {type: 'application/pdf'});
                    var fileURL = URL.createObjectURL(file);
                    me.pdf = $sce.trustAsResourceUrl(fileURL);
                    deferred.resolve("Bill successfully created");
                },
                function () {
                    deferred.reject("Could not generate bill");
                }
            );

            return deferred.promise;
        };

        this.getExistingBills = function (userId) {
            var deferred = $q.defer();

            restService.getBills(userId, 0).then(
                function (response) {
                    deferred.resolve(response.data);
                },
                function () {
                    deferred.reject("Could not load bills for this user");
                }
            );

            return deferred.promise;
        };

        //https://docs.angularjs.org/guide/directive#creating-a-directive-that-wraps-other-elements
        this.onDateChanged = function (from, to) {
            me.fromDate = dateUtil.formatDateFromTimestamp(from);
            me.toDate = dateUtil.formatDateFromTimestamp(to);
        };

        this.getUsers = function () {
            restService.getAllUsers()
                .then(
                function(response) {
                    me.users = responseParser.getUserListFromResponse(response.data);
                }, function () {
                    alertService.showError("Could not fetch list of users");
                }
            );
        };

        this.generateBill = function (user) {
            if (!me.fromDate || !me.toDate) {
                alertService.showError("No date span selected");
            }
            else {
                var sessionId = sessionService.getSessionId();

                me.getKeystoneIdForUser(user, sessionId)
                    .then(me.loadExternalUserIds)
                    .then(me.getExternalBillItems)
                    .then(me.getInternalBillItems)
                    .then(me.generateBillPDF).then(
                    function (msg) {
                        me.showPdfModal();
                        alertService.showSuccess(msg);
                    },
                    function (msg) {
                        alertService.showError(msg);
                    }
                );
            }
        };

        this.showExistingBills = function (user) {
            me.getKeystoneIdForUser(user)
                .then(
                function (response) {
                    return me.getExistingBills(response.userId);
                }
            )
                .then(
                function (response) {
                    me.showUserBillsModal(response);
                },
                function (msg) {
                    alertService.showError(msg);
                }
            );
        };

        this.getUsers();

    }

})();
