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
    angular.module('dashboard.bills')
        .controller('BillController', BillController);

    /*
     Controllers, Factories, Services, Directives
     */
    BillController.$inject = [
        '$sce', '$modal', 'sessionService', 'restService', 'billDataService',
        'alertService', 'dateUtil'
    ];
    function BillController($sce, $modal, sessionService, restService, billDataService,
                            alertService, dateUtil) {
        var me = this;
        this.bills = [];
        this.pdf;
        this.paids = [];
        this.dues = [];


        var loadBillsSuccess = function (response) {
            me.bills = response.data;
        };

        var loadBillsError = function () {
            alertService.showError("Could not load bills");
        };

        var loadPdfSuccess = function (response) {
            //https://stackoverflow.com/questions/21628378/angularjs-display-blob-pdf-in-an-angular-app
            var file = new Blob([response.data], {type: 'application/pdf'});
            var fileURL = URL.createObjectURL(file);
            pdf = $sce.trustAsResourceUrl(fileURL);
            me.openModal(pdf);
        };

        var loadPdfError = function () {
            alertService.showError("Could not load PDF file");
        };

        this.openModal = function (pdf) {
            var modalInstance = $modal.open({
                templateUrl: 'modals/pdf/pdf-modal.html',
                controller: 'PdfModalController',
                controllerAs: 'pdfModalCtrl',
                size: 'lg',
                resolve: {
                    pdf: function () {
                        return pdf;
                    }
                }
            });
        };

        this.getClassForBill = function (bill) {
            var dateToday = dateUtil.getFormattedDateToday();
            var isDue = dateUtil.compareDateStrings(bill.due, dateToday) == 1;

            if (bill.paid) {
                if(this.paids.indexOf(bill)<0){
                    this.paids.push(bill);
                }
                return "success";
            }
            else if (isDue) {
                if(this.dues.indexOf(bill)<0){
                    this.dues.push(bill);
                }
                return "danger";
            }
            //check for the total prize and bind it to a var like in paids&dues, wait till checking the rates.
            return "info";
        };

        this.showDetails = function (bill) {
            var userId = sessionService.getKeystoneId();
            restService.getBillPDF(userId, bill.from, bill.to)
                .then(loadPdfSuccess, loadPdfError);
        };

        this.getBills = function () {
            restService.getBills(sessionService.getKeystoneId(), "true")
                .then(loadBillsSuccess, loadBillsError);
        };

        this.getBills();
    }

})();
