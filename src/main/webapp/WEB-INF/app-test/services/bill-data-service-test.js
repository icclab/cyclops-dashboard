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

describe('BillDataService', function() {
    var service;

    /*
        Fake Data
     */
    var fakeMeterName = "network.incoming.bytes";
    var fakeChargeResponse = {
        charge: {
            columns: [
                "time","sequence_number","resource","userid","usage","rate","price"
            ],
            points: [
                [123,2,"network.incoming.bytes","a",5.7,3,1.25],
                [456,1,"network.incoming.bytes","a",2.35,1,2.56]
            ]
        }
    };
    var fakeFormattedBillData = {
        'network.incoming.bytes': {
            resource: 'network.incoming.bytes',
            unit: "",
            usage: 8.05,
            rate: 3.81 / 8.05,
            price: 3.81,
            discount: 0
        }
    };

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
        inject(function(_billDataService_) {
            service = _billDataService_;
        });
    });

    /*
        Tests
     */
    describe('setRawData', function() {
        it('stores correctly formatted data', function() {
            service.setRawData(fakeChargeResponse);
            expect(service.getFormattedData()).toEqual(fakeFormattedBillData);
        });

        it('ignores incorrectly formatted data', function() {
            service.setRawData(fakeChargeResponse.charge);
            expect(service.getFormattedData()).toEqual({});
        });
    });

    describe('getFormattedColumns', function() {
        it('should correctly format columns', function() {
            var res = service.getFormattedColumns();
            expect(res).toEqual(['resource', 'unit', 'usage', 'rate', 'charge']);
        });
    });
});
