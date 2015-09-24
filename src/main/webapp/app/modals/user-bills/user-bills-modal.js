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
    angular.module('dashboard.modals')
        .controller('UserBillsModalController', UserBillsModalController);

    /*
        Controllers, Factories, Services, Directives
    */
   UserBillsModalController.$inject = ['$scope', '$sce', '$modalInstance', '$modal', 'bills', 'sessionService', 'restService'];
    function UserBillsModalController($scope, $sce, $modalInstance, $modal, bills, sessionService, restService) {
        var me = this;
        this.bills = bills;

        this.close = function () {
            $modalInstance.close();
        };

        this.emit = function () {
            $scope.$emit('update',[1])
        }

        this.showDetails = function(bill) {
            var userId = sessionService.getKeystoneId();
            restService.getBillPDF(userId, bill.from, bill.to)
                .then(loadPdfSuccess, loadPdfError);
        };

        this.markAsPaid = function(bill, paid){
            var userId= sessionService.getKeystoneId();
            var approved;
            if(bill.approved)
            restService.updateBillStatus(userId, bill.from, bill.to, bill.approved, paid)
                .then(this.close);
        }

        this.updateBillStatus = function(bill, approved) {
            var userId = sessionService.getKeystoneId();
            restService.updateBillStatus(userId, bill.from, bill.to, approved, bill.paid)
                .then(this.close);
                //.then(this.emit());
                //.then($modalInstance.UserBillsModalController);
        }

        var loadPdfSuccess = function(response) {
            //https://stackoverflow.com/questions/21628378/angularjs-display-blob-pdf-in-an-angular-app
            var file = new Blob([response.data], {type: 'application/pdf'});
            var fileURL = URL.createObjectURL(file);
            pdf = $sce.trustAsResourceUrl(fileURL);
            me.openModal(pdf);
        };

        var loadPdfError = function() {
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

    }

})();
