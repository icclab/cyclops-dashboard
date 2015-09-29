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

describe('ExternalChargeDataService', function() {
    var service;
    var scopeMock;

    /*
        Fake Data
     */
    var fakeMeterName = "network.incoming.bytes";
    var fakeChartData = {
        charge: {
            columns: [
                "time","sequence_number","resource","userid","usage","rate","price"
            ],
            points: [
                [1427284499563,2,"network.incoming.bytes","a",2.0395754E7,3,611.87262],
                [1427283899512,1,"network.incoming.bytes","a",1.653124E7,1,165.3124],
            ]
        }
    };
    var fakeFormattedChartData = {
        "network.incoming.bytes": {
            name: fakeMeterName,
            columns: ["time", "value"],
            points: [
                [1427284499563, 611.87262],
                [1427283899512, 165.3124]
            ],
            enabled: true,
            type: "gauge",
            unit: ""
        }
    };
    var fakeEventData = [{
        name: fakeMeterName,
        unit: "",
        chartType: "gauge",
        serviceType: "charge_external"
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
        inject(function(_externalChargeDataService_) {
            service = _externalChargeDataService_;
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

    describe('getFormattedColumns', function() {
        it('should correctly format columns', function() {
            var res = service.getFormattedColumns();
            expect(res).toEqual(["time", "value"]);
        });
    });
});
