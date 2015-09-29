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

describe('ExternalUsageDataService', function() {
    var service;
    var scopeMock;

    /*
        Fake Data
     */
    var fakeChartData = {
        usage: {
            External: [{
                columns: ["time", "sequence_number", "timestamp", "usage"],
                name: "test.external.meter1",
                points: [
                    [1433771461073, 355709310001, 1433771461, 17],
                    [1433770861042, 355628670001, 1433770861, 43]
                ]
            }]
        }
    };
    var fakeFormattedChartData = {
        "test.external.meter1": {
            name: "test.external.meter1",
            columns: ["time", "value"],
            points: [
                [1433771461073, 17],
                [1433770861042, 43]
            ],
            enabled: true,
            type: "gauge",
            unit: ""
        }
    };
    var fakeEventData = [{
        name: "test.external.meter1",
        unit: "",
        chartType: "gauge",
        serviceType: "usage_external"
    }];


    /*
        Test setup
     */
    beforeEach(function() {
        resetAllMocks();

        /*
            Load module
         */
        module('dashboard.services');

        scopeMock = jasmine.createSpyObj(
            'scope',
            ['$broadcast']
        );

        /*
            Inject dependencies and configure mocks
         */
        inject(function(_externalUsageDataService_) {
            service = _externalUsageDataService_;
        });
    });

    /*
        Tests
     */
    describe('setRawData', function() {
        it('stores correctly formatted data', function() {
            service.setRawData(fakeChartData);
            expect(service.getFormattedData()).toEqual(fakeFormattedChartData);
        });

        it('ignores incorrectly formatted data', function() {
            service.setRawData(fakeChartData.usage);
            expect(service.getFormattedData()).toEqual({});
        });
    });

    describe('notifyChartDataReady', function() {
        it('should broadcast CHART_DATA_READY', function() {
            service.notifyChartDataReady(scopeMock);
            expect(scopeMock.$broadcast).toHaveBeenCalledWith('CHART_DATA_READY', []);
        });

        it('should send chart information with event', function() {
            service.setRawData(fakeChartData);
            service.notifyChartDataReady(scopeMock);
            expect(scopeMock.$broadcast)
                .toHaveBeenCalledWith('CHART_DATA_READY', fakeEventData);
        });
    });

    describe('formatPoints', function() {
        it('should correctly format points for external meters', function() {
            var res = service.formatPoints(
                fakeChartData.usage.External[0].points,
                fakeChartData.usage.External[0].columns
            );
            expect(res).toEqual(fakeFormattedChartData["test.external.meter1"].points);
        });
    });

    describe('getFormattedColumns', function() {
        it('should correctly format columns', function() {
            var res = service.getFormattedColumns();
            expect(res).toEqual(["time", "value"]);
        });
    });
});

