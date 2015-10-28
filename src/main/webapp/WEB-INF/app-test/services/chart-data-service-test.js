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

describe('ChartDataService', function() {
    var service;

    /*
        Fake Data
     */
    var usage = "usage";
    var charge = "charge";
    var rate = "rate";
    var fakeDateTime = "2015-01-01 13:33";
    var fakeCumulativeName = "cumulativeChart";
    var fakeGaugeName = "gaugeChart";
    var fakePointValue1 = 443309;
    var fakePointValue2 = 142012;
    var fakeUsageData = {
        cumulativeChart: {
            name: fakeCumulativeName,
            columns: ["time", "value"],
            points: [
                [1428478324000, fakePointValue1],
                [1428478324000, fakePointValue2]
            ],
            enabled: true,
            type: "cumulative",
            unit: "B"
        },
        gaugeChart: {
            name: fakeCumulativeName,
            columns: ["time", "value"],
            points: [
                [1428478324000, fakePointValue1],
                [1428478324000, fakePointValue2]
            ],
            enabled: true,
            type: "gauge",
            unit: "B"
        }
    };
    var fakeRateData = {
        gaugeChart: {
            name: fakeCumulativeName,
            columns: ["time", "value"],
            points: [
                [1428497295803, 2],
                [1428497055806, 3]
            ],
            enabled: true,
            type: "gauge",
            unit: "B"
        }
    };
    var fakeGaugeResult = [
        {
            x: fakeUsageData.gaugeChart.points[1][0],
            y: fakeUsageData.gaugeChart.points[1][1]
        },
        {
            x: fakeUsageData.gaugeChart.points[0][0],
            y: fakeUsageData.gaugeChart.points[0][1]
        }
    ];
    var fakeCumulativeResult = fakeUsageData.cumulativeChart.points[0][1] + fakeUsageData.cumulativeChart.points[1][1];

    /*
        Test setup
     */
    beforeEach(function() {
        resetAllMocks();

        /*
            Load module
         */
        module('dashboard.services');

        dateUtilMock.formatDateTimeFromTimestamp.and.returnValue(fakeDateTime);

        module(function($provide) {
            $provide.value('dateUtil', dateUtilMock);
            $provide.value('usageDataService', usageDataServiceMock);
            $provide.value('rateDataService', rateDataServiceMock);
            $provide.value('chargeDataService', chargeDataServiceMock);
        });

        /*
            Inject dependencies and configure mocks
         */
        inject(function(_chartDataService_) {
            service = _chartDataService_;
        });
    });

    /*
        Tests
     */
    describe('getCumulativeMeterData', function() {
        beforeEach(function() {
            spyOn(service, 'getServiceDelegate').and.returnValue(usageDataServiceMock);
        });

        it('returns the correct data if available', function() {
            usageDataServiceMock.getFormattedData.and.returnValue(fakeUsageData);
            spyOn(service, 'getGaugeMeterData').and.returnValue(fakeGaugeResult);

            var res = service.getCumulativeMeterData(usage, fakeCumulativeName);
            expect(res).toEqual(fakeCumulativeResult);
        });

        it('returns an error if no data available', function() {
            usageDataServiceMock.getFormattedData.and.returnValue(undefined);
            var res = service.getCumulativeMeterData(usage, fakeCumulativeName);
            expect(res).toEqual(0);
        });
    });

    describe('getGaugeMeterData', function() {
        beforeEach(function() {
            spyOn(service, 'getServiceDelegate').and.returnValue(usageDataServiceMock);
        });

        it('returns the correct usage data if available', function() {
            usageDataServiceMock.getFormattedData.and.returnValue(fakeUsageData);
            var res = service.getGaugeMeterData(usage, fakeGaugeName);
            expect(res).toEqual(fakeGaugeResult);
        });

        it('returns empty data if no usage data is available', function() {
            usageDataServiceMock.getFormattedData.and.returnValue(undefined);
            var res = service.getGaugeMeterData(usage, fakeGaugeName);
            expect(res).toEqual([]);
        });
    });

    describe('getSampledGaugeMeterData', function() {
        it('returns the correct usage data if available', function() {
            spyOn(service, 'getGaugeMeterData').and.returnValue(fakeGaugeResult);
            spyOn(service, 'doSampling').and.returnValue(1);

            service.getSampledGaugeMeterData(usage, fakeGaugeName);

            expect(service.getGaugeMeterData)
                .toHaveBeenCalledWith(usage, fakeGaugeName);
            expect(service.doSampling)
                .toHaveBeenCalledWith(fakeGaugeResult, 100);
        });
    });

    describe('doSampling', function() {
        it('returns untouched array if length < maxNum', function() {
            var smallArray = [1, 2, 3];
            var res = service.doSampling(smallArray, 5);
            expect(res).toEqual(smallArray);
        });
        it('returns sampled array if length > maxNum', function() {
            var res = service.doSampling([1, 2, 3, 4], 2);
            expect(res).toEqual([1, 3]);
        });
    });

    describe('getServiceDelegate', function() {
        it('returns usageDataService if selected', function() {
            var res = service.getServiceDelegate(usage);
            expect(res).toEqual(usageDataServiceMock);
        });

        it('returns chargeDataService if selected', function() {
            var res = service.getServiceDelegate(charge);
            expect(res).toEqual(chargeDataServiceMock);
        });

        it('returns rateDataService if selected', function() {
            var res = service.getServiceDelegate(rate);
            expect(res).toEqual(rateDataServiceMock);
        });
    });
});

