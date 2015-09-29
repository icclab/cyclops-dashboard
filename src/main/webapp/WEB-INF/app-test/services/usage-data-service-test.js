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

describe('UsageDataService', function() {
    var service;
    var scopeMock;

    /*
        Fake Data
     */
    var fakeCumulativeName = "network.incoming.bytes";
    var fakeGaugeName = "cpu_util";
    var fakeChartData = {
        'usage': {
            'OpenStack': [
                {
                    'name': fakeCumulativeName,
                    'columns': ["time", "sequence_number", "type", "unit", "usage"],
                    'points': [
                        [1428568125000, 7654340001, "cumulative", "B", 14600],
                        [1428567525000, 7654830001, "cumulative", "B", 16951]
                    ]
                },
                {
                    'name': fakeGaugeName,
                    'columns': ["time", "sequence_number", "avg", "type", "unit"],
                    'points': [
                        [1428555539000, 7432920001, 0.22915418, "gauge", "%"],
                        [1428556139000, 7443990001, 0.22790419, "gauge", "%"]
                    ]
                }
            ]
        }
    };
    var fakeFormattedChartData = {
        "network.incoming.bytes": {
            'name': fakeCumulativeName,
            'columns': ["time", "value"],
            'points': [
                [1428568125000, 14600],
                [1428567525000, 16951]
            ],
            'enabled': true,
            'type': "cumulative",
            'unit': "B"
        },
        "cpu_util": {
            'name': fakeGaugeName,
            'columns': ["time", "value"],
            'points': [
                [1428555539000, 0.22915418],
                [1428556139000, 0.22790419]
            ],
            'enabled': true,
            'type': "gauge",
            'unit': "%"
        }
    };
    var fakeEventData = [
        {
            name: fakeCumulativeName,
            unit: "B",
            chartType: "cumulative",
            serviceType: "usage"
        },
        {
            name: fakeGaugeName,
            unit: "%",
            chartType: "gauge",
            serviceType: "usage"
        },
    ];

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
        inject(function(_usageDataService_) {
            service = _usageDataService_;
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
        it('should correctly format points for cumulative meters', function() {
            var res = service.formatPoints(
                fakeChartData.usage.OpenStack[0].points,
                fakeChartData.usage.OpenStack[0].columns
            );
            expect(res).toEqual(fakeFormattedChartData[fakeCumulativeName].points);
        });

        it('should correctly format points for gauge meters', function() {
            var res = service.formatPoints(
                fakeChartData.usage.OpenStack[1].points,
                fakeChartData.usage.OpenStack[1].columns
            );
            expect(res).toEqual(fakeFormattedChartData[fakeGaugeName].points);
        });
    });

    describe('getFormattedColumns', function() {
        it('should correctly format columns', function() {
            var res = service.getFormattedColumns();
            expect(res).toEqual(["time", "value"]);
        });
    });

    describe('clearData', function() {
        it('should clear data', function() {
            service.setRawData(fakeChartData);
            service.clearData();
            expect(service.getFormattedData()).toEqual({});
        });
    });
});

