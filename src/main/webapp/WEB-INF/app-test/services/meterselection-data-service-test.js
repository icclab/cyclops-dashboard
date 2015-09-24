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

describe('MeterselectionDataService', function() {
    var service;
    var scopeMock;

    /*
        Fake Data
     */
     var fakeMeterselectionData = {
        columns: ["time", "sequence_number", "metertype", "metername", "status", "source", "metersource"],
        name: "meterselection",
        points: [
            [1428668604339, 7914370001, "gauge", "cpu_util", 1, "cyclops-ui", "openstack"],
            [1428668604339, 7914310001, "cumulative", "disk.write.bytes", 0, "cyclops-ui", "openstack"]
        ]
     };
    var fakeOpenstackData = [
        { name:'disk.write.bytes', type:'cumulative', source:'openstack' }
    ];
    var fakeFormattedUdrData = {
        "cpu_util": {
            name: "cpu_util",
            enabled: true,
            type: "gauge",
            source: "openstack"
        },
        "disk.write.bytes": {
            name: "disk.write.bytes",
            enabled: false,
            type: "cumulative",
            source: "openstack"
        }
     };
     var fakeFormattedOpenstackData = {
        "disk.write.bytes": fakeFormattedUdrData["disk.write.bytes"]
     }

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
        inject(function(_meterselectionDataService_) {
            service = _meterselectionDataService_;
        });
    });

    /*
        Tests
     */
    describe('setRawUdrData', function() {
        it('stores correctly formatted data', function() {
            service.setRawUdrData(fakeMeterselectionData);
            expect(service.getFormattedUdrData()).toEqual(fakeFormattedUdrData);
        });

        it('ignores incorrectly formatted data', function() {
            service.setRawUdrData({});
            expect(service.getFormattedUdrData()).toEqual({});
        });
    });

    describe('setRawOpenstackData', function() {
        it('stores correctly formatted data', function() {
            service.setRawOpenstackData(fakeOpenstackData);
            expect(service.getFormattedOpenstackData()).toEqual(fakeFormattedOpenstackData);
        });

        it('ignores incorrectly formatted data', function() {
            service.setRawOpenstackData({});
            expect(service.getFormattedOpenstackData()).toEqual({});
        });
    });

    describe('getSelectedMeterNames', function() {
        it('returns array of selected meters', function() {
            service.setRawUdrData(fakeMeterselectionData);
            expect(service.getSelectedMeterNames()).toEqual(["cpu_util"]);
        });
    });
});

