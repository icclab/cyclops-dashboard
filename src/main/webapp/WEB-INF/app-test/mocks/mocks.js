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
var restServiceMock = jasmine.createSpyObj(
    'restService',
    [
        'getUdrData', 'sendKeystoneAuthRequest', 'sendLoginRequest',
        'requestSessionToken', 'storeKeystoneId', 'getTokenInfo',
        'updateUdrMeters', 'getKeystoneMeters', 'getUdrMeters',
        'getAdminGroupInfo', 'getUsers', 'getRateForMeter',
        'getChargeForUser', 'getActiveRatePolicy', 'setActiveRatePolicy',
        'updateAdmins', 'createBillPDF', 'getUserInfo', 'getBills', 'getBillPDF',
        'getBillingInformation', 'getExternalUserIds', 'updateExternalUserIds',
        'addExternalMeterSource'
    ]
);

var sessionServiceMock = jasmine.createSpyObj(
    'sessionService',
    [
        'clearSession', 'getSessionId', 'getAccessToken', 'getIdToken',
        'getUsername', 'getTokenType', 'getExpiration', 'getKeystoneId',
        'setSessionId', 'setAccessToken', 'setIdToken', 'setUsername',
        'setTokenType', 'setExpiration', 'setKeystoneId', 'setAdmin',
        'isAdmin', 'isAuthenticated', 'setExternalIds', 'getExternalIds'
    ]
);

var usageDataServiceMock = jasmine.createSpyObj(
    'usageDataService',
    [
        'notifyChartDataReady', 'setRawData', 'formatPoints',
        'getFormattedColumns', 'getFormattedData', 'clearData'
    ]
);

var externalUsageDataServiceMock = jasmine.createSpyObj(
    'externalUsageDataService',
    [
        'notifyChartDataReady', 'setRawData', 'formatPoints',
        'getFormattedColumns', 'getFormattedData', 'clearData'
    ]
);

var rateDataServiceMock = jasmine.createSpyObj(
    'rateDataService',
    [
        'notifyChartDataReady', 'setRawData', 'formatPoints',
        'getFormattedColumns', 'getFormattedData', 'clearData'
    ]
);

var chargeDataServiceMock = jasmine.createSpyObj(
    'chargeDataService',
    [
        'notifyChartDataReady', 'setRawData', 'formatPoints',
        'getFormattedColumns', 'getFormattedData', 'clearData'
    ]
);

var externalChargeDataServiceMock = jasmine.createSpyObj(
    'externalChargeDataService',
    [
        'notifyChartDataReady', 'setRawData', 'formatPoints',
        'getFormattedColumns', 'getFormattedData', 'clearData'
    ]
);

var meterselectionDataServiceMock = jasmine.createSpyObj(
    'meterselectionDataService',
    [
        'setRawUdrData', 'setRawOpenstackData', 'getFormattedUdrData',
        'getFormattedOpenstackData', 'getSelectedMeterNames'
    ]
);

var billDataServiceMock = jasmine.createSpyObj(
    'billDataService',
    [
        'setRawData', 'getFormattedData', 'formatPoints',
        'getFormattedColumns'
    ]
);

var chartDataServiceMock = jasmine.createSpyObj(
    'chartDataService',
    [
        'getServiceDelegate', 'setLabelIfSpaceAvailable',
        'getCumulativeMeterData', 'getGaugeMeterData',
    ]
);

var alertServiceMock = jasmine.createSpyObj(
    'alertService',
    [
        'showError', 'showSuccess'
    ]
);

var dateUtilMock = jasmine.createSpyObj(
    'dateUtil',
    [
        'getTimestamp', 'getFormattedTimeNow',
        'getFormattedDateToday', 'getFormattedDateYesterday',
        'formatDate', 'formatTime', 'formatDateTime',
        'formatDateFromTimestamp', 'formatTimeFromTimestamp',
        'formatDateTimeFromTimestamp', 'getFormattedDateTimeNow',
        'addDaysToDateString', 'compareDateStrings'
    ]
);

var responseParserMock = jasmine.createSpyObj(
    'responseParser',
    [
        'getStaticRatingListFromResponse', 'getAdminListFromResponse',
        'getUserListFromResponse', 'getAdminStatusFromResponse'
    ]
);

var modalMock = jasmine.createSpyObj(
    '$modal',
    [
        'open', 'close'
    ]
);

var stateMock = jasmine.createSpyObj(
    '$state',
    [
        'go'
    ]
);

//Mocking the URL class used for PDFs
var URL = jasmine.createSpyObj(
    'URL',
    ['createObjectURL']
);

function resetMock(mockObject) {
    for(var func in mockObject) {
        mockObject[func].calls.reset();
    }
}

function resetAllMocks() {
    resetMock(restServiceMock);
    resetMock(sessionServiceMock);
    resetMock(usageDataServiceMock);
    resetMock(externalUsageDataServiceMock);
    resetMock(rateDataServiceMock);
    resetMock(chargeDataServiceMock);
    resetMock(externalChargeDataServiceMock);
    resetMock(meterselectionDataServiceMock);
    resetMock(billDataServiceMock);
    resetMock(chartDataServiceMock);
    resetMock(alertServiceMock);
    resetMock(dateUtilMock);
    resetMock(responseParserMock);
    resetMock(modalMock);
    resetMock(stateMock);
}
