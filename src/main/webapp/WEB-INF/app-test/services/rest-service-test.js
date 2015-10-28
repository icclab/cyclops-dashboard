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

describe('RestService', function() {
    var restService;
    var $httpBackend;

    /*
        Fake Data
     */
    var fakeUser = "testuser";
    var fakePass = "testpass";
    var fakeKeystoneId = "123";
    var fakeSessionId = "abc123";
    var fakeAccessToken = "5s5s5s";
    var fakeUdrMeters = { meter: "bla" };
    var fakeMeterName = "net";
    var fakeFrom = "2015-01-01 12:00:00";
    var fakeTo = "2015-01-02 12:00:00";
    var fakeRateQuery = "?resourcename="+fakeMeterName+"&from="+fakeFrom+"&to="+fakeTo;
    var fakeChargeQuery = "?userid="+fakeUser+"&from="+fakeFrom+"&to="+fakeTo;
    var fakeAccessQuery = "?access_token=" + fakeAccessToken;
    var fakeSessionQuery = "?session_id=" + fakeSessionId;
    var fakeUserIdQuery = "?user_id=" + fakeUser;
    var fakeBillQuery = "?user_id=" + fakeUser + "&from=" + fakeFrom + "&to=" + fakeTo;
    var fakePolicyConfig = { rate_policy:'dynamic' };
    var fakeAdmins = ['test1', 'user2'];
    var fakeUpdatedAdmins = {
        'admins': fakeAdmins,
        'sessionId': fakeSessionId
    };
    var fakeBillItems = {
        "cpu_util": {
            price: 5
        }
    };
    var fakeBill = {
        userId: fakeUser,
        from: fakeFrom,
        to: fakeTo,
        items: fakeBillItems
    };

    /*
        Test setup
     */
    beforeEach(function(){
        resetAllMocks();

        /*
            Load module
         */
        module('dashboard.services');

        sessionServiceMock.getAccessToken.and.returnValue(fakeAccessToken);

        module(function($provide) {
            $provide.value('sessionService', sessionServiceMock);
        });

        /*
            Inject dependencies and configure mocks
         */
        inject(function(_restService_, _$httpBackend_) {
            restService = _restService_;
            $httpBackend = _$httpBackend_;
        });

        $httpBackend.whenPOST("/dashboard/rest/usage").respond(200);
        $httpBackend.whenGET("/dashboard/rest/rate" + fakeRateQuery).respond(200);
        $httpBackend.whenGET("/dashboard/rest/rate/status").respond(200);
        $httpBackend.whenPOST("/dashboard/rest/rate/status").respond(200);
        $httpBackend.whenGET("/dashboard/rest/charge" + fakeChargeQuery).respond(200);
        $httpBackend.whenPOST("/dashboard/rest/keystone").respond(200);
        $httpBackend.whenPOST("/dashboard/rest/login").respond(200);
        $httpBackend.whenPOST("/dashboard/rest/session").respond(200);
        $httpBackend.whenPUT("/dashboard/rest/keystone").respond(200);
        $httpBackend.whenGET("/dashboard/rest/tokeninfo" + fakeAccessQuery).respond(200);
        $httpBackend.whenGET("/dashboard/rest/keystonemeters").respond(200);
        $httpBackend.whenGET("/dashboard/rest/udrmeters").respond(200);
        $httpBackend.whenPOST("/dashboard/rest/udrmeters").respond(200);
        $httpBackend.whenGET("/dashboard/rest/udrmeters/externalids" + fakeUserIdQuery).respond(200);
        $httpBackend.whenPOST("/dashboard/rest/udrmeters/externalids").respond(200);
        $httpBackend.whenPOST("/dashboard/rest/udrmeters/externalsources").respond(200);
        $httpBackend.whenGET("/dashboard/rest/users" + fakeSessionQuery).respond(200);
        $httpBackend.whenGET("/dashboard/rest/admins" + fakeSessionQuery).respond(200);
        $httpBackend.whenPUT("/dashboard/rest/admins").respond(200);
        $httpBackend.whenGET("/dashboard/rest/billing" + fakeChargeQuery).respond(200);
        $httpBackend.whenGET("/dashboard/rest/billing/bills" + fakeUserIdQuery).respond(200);
        $httpBackend.whenPOST("/dashboard/rest/billing/bills/pdf").respond(200);
        $httpBackend.whenGET("/dashboard/rest/billing/bills/pdf" + fakeBillQuery).respond(200);
        $httpBackend.whenGET("/dashboard/rest/users/" + fakeUser + fakeSessionQuery).respond(200);
    });

    /*
        Test teardown
     */
    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    /*
        Tests
     */
    describe('getUdrData', function() {
        it('should send complete POST request', function() {
            $httpBackend.expectPOST("/dashboard/rest/usage", {
                'keystoneId': fakeKeystoneId,
                'from': fakeFrom,
                'to': fakeTo
            });
            restService.getUdrData(fakeKeystoneId, fakeFrom, fakeTo);
            $httpBackend.flush();
        });
    });

    describe('sendKeystoneAuthRequest', function() {
        it('should send complete POST request', function() {
            $httpBackend.expectPOST("/dashboard/rest/keystone", {
                'username': fakeUser,
                'password': fakePass
            });
            restService.sendKeystoneAuthRequest(fakeUser, fakePass);
            $httpBackend.flush();
        });
    });

    describe('sendLoginRequest', function() {
        it('should send complete POST request', function() {
            $httpBackend.expectPOST("/dashboard/rest/login", {
                'username': fakeUser,
                'password': fakePass
            });
            restService.sendLoginRequest(fakeUser, fakePass);
            $httpBackend.flush();
        });
    });

    describe('requestSessionToken', function() {
        it('should send complete POST request', function() {
            $httpBackend.expectPOST("/dashboard/rest/session", {
                'username': fakeUser,
                'password': fakePass
            });
            restService.requestSessionToken(fakeUser, fakePass);
            $httpBackend.flush();
        });
    });

    describe('storeKeystoneId', function() {
        it('should send complete PUT request', function() {
            $httpBackend.expectPUT("/dashboard/rest/keystone", {
                'username': fakeUser,
                'sessionId': fakeSessionId,
                'keystoneId': fakeKeystoneId
            });
            restService.storeKeystoneId(fakeUser, fakeKeystoneId, fakeSessionId);
            $httpBackend.flush();
        });
    });

    describe('getTokenInfo', function() {
        it('should send complete GET request', function() {
            $httpBackend.expectGET("/dashboard/rest/tokeninfo" + fakeAccessQuery);
            restService.getTokenInfo(fakeAccessToken);
            $httpBackend.flush();
        });
    });

    describe('getKeystoneMeters', function() {
        it('should send complete GET request', function() {
            $httpBackend.expectGET("/dashboard/rest/keystonemeters");
            restService.getKeystoneMeters();
            $httpBackend.flush();
        });
    });

    describe('getAdminGroupInfo', function() {
        it('should send complete GET request', function() {
            $httpBackend.expectGET("/dashboard/rest/admins" + fakeSessionQuery);
            restService.getAdminGroupInfo(fakeSessionId);
            $httpBackend.flush();
        });
    });

    describe('getUsers', function() {
        it('should send complete GET request', function() {
            $httpBackend.expectGET("/dashboard/rest/users" + fakeSessionQuery);
            restService.getUsers(fakeSessionId);
            $httpBackend.flush();
        });
    });

    describe('getUdrMeters', function() {
        it('should send complete GET request', function() {
            $httpBackend.expectGET("/dashboard/rest/udrmeters");
            restService.getUdrMeters();
            $httpBackend.flush();
        });
    });

    describe('updateUdrMeters', function() {
        it('should send complete POST request', function() {
            $httpBackend.expectPOST("/dashboard/rest/udrmeters", fakeUdrMeters);
            restService.updateUdrMeters(fakeUdrMeters);
            $httpBackend.flush();
        });
    });

    describe('getRateForMeter', function() {
        it('should send complete GET request', function() {
            $httpBackend.expectGET("/dashboard/rest/rate" + fakeRateQuery);
            restService.getRateForMeter(fakeMeterName, fakeFrom, fakeTo);
            $httpBackend.flush();
        });
    });

    describe('getChargeForUser', function() {
        it('should send complete GET request', function() {
            $httpBackend.expectGET("/dashboard/rest/charge" + fakeChargeQuery);
            restService.getChargeForUser(fakeUser, fakeFrom, fakeTo);
            $httpBackend.flush();
        });
    });

    describe('getActiveRatePolicy', function() {
        it('should send complete GET request', function() {
            $httpBackend.expectGET("/dashboard/rest/rate/status");
            restService.getActiveRatePolicy();
            $httpBackend.flush();
        });
    });

    describe('setActiveRatePolicy', function() {
        it('should send complete POST request', function() {
            $httpBackend.expectPOST("/dashboard/rest/rate/status", fakePolicyConfig);
            restService.setActiveRatePolicy(fakePolicyConfig);
            $httpBackend.flush();
        });
    });

    describe('updateAdmins', function() {
        it('should send complete PUT request', function() {
            $httpBackend.expectPUT("/dashboard/rest/admins", {
                'admins': fakeAdmins,
                'sessionId': fakeSessionId
            });
            restService.updateAdmins(fakeAdmins, fakeSessionId);
            $httpBackend.flush();
        });
    });

    describe('getUserInfo', function() {
        it('should send complete GET request', function() {
            $httpBackend.expectGET("/dashboard/rest/users/" + fakeUser + fakeSessionQuery);
            restService.getUserInfo(fakeUser, fakeSessionId);
            $httpBackend.flush();
        });
    });

    describe('createBillPDF', function() {
        it('should send complete POST request', function() {
            $httpBackend.expectPOST("/dashboard/rest/billing/bills/pdf", fakeBill);
            restService.createBillPDF(fakeBill);
            $httpBackend.flush();
        });
    });

    describe('getBillPDF', function() {
        it('should send complete GET request', function() {
            $httpBackend.expectGET("/dashboard/rest/billing/bills/pdf" + fakeBillQuery);
            restService.getBillPDF(fakeUser, fakeFrom, fakeTo);
            $httpBackend.flush();
        });
    });

    describe('getBills', function() {
        it('should send complete GET request', function() {
            $httpBackend.expectGET("/dashboard/rest/billing/bills" + fakeUserIdQuery);
            restService.getBills(fakeUser);
            $httpBackend.flush();
        });
    });

    describe('getBillingInformation', function() {
        it('should send complete GET request', function() {
            $httpBackend.expectGET("/dashboard/rest/billing" + fakeChargeQuery);
            restService.getBillingInformation(fakeUser, fakeFrom, fakeTo);
            $httpBackend.flush();
        });
    });

    describe('getExternalUserIds', function() {
        it('should send complete GET request', function() {
            $httpBackend.expectGET("/dashboard/rest/udrmeters/externalids" + fakeUserIdQuery);
            restService.getExternalUserIds(fakeUser);
            $httpBackend.flush();
        });
    });

    describe('updateExternalUserIds', function() {
        it('should send complete POST request', function() {
            $httpBackend.expectPOST("/dashboard/rest/udrmeters/externalids", {
                userId: fakeUser,
                externalIds: [1]
            });
            restService.updateExternalUserIds(fakeUser, [1]);
            $httpBackend.flush();
        });
    });

    describe('addExternalMeterSource', function() {
        it('should send complete POST request', function() {
            $httpBackend.expectPOST("/dashboard/rest/udrmeters/externalsources", {
                source: "test"
            });
            restService.addExternalMeterSource("test");
            $httpBackend.flush();
        });
    });

});
