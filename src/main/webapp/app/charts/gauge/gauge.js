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

(function() {

    angular.module('dashboard.charts')
        .directive('gaugeChart', GaugeChartDeclaration);

    function GaugeChartDeclaration() {
        return {
            scope: {},
            restrict: 'E',
            templateUrl: 'charts/gauge/gauge.html',
            controller: GaugeChartController,
            controllerAs: 'gaugeChartCtrl',
            link: onLink
        };
    }

    function onLink(scope, el, attr, controller) {
        controller.chartName = attr.name;
        controller.chartDataType = attr.type;
        controller.chartDataUnit = attr.unit;
        controller.updateGraph();
    }

    GaugeChartController.$inject = ['$scope', 'dateUtil', 'chartDataService'];
    function GaugeChartController($scope, dateUtil, chartDataService) {
        var me = this;
        this.chartDataType = undefined;
        this.chartName = undefined;
        this.chartDataUnit = undefined;
        this.chartData = [];
        this.chartOptions = {};

        this.updateGraph = function() {
            var result = chartDataService.getSampledGaugeMeterData(
                me.chartDataType,
                me.chartName
            );

            me.chartOptions = {
                chart: {
                    type: 'lineChart',
                    height: 250,
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 40,
                        left: 80
                    },
                    x: function(d){ return d.x; },
                    y: function(d){ return d.y; },
                    useInteractiveGuideline: true,
                    xAxis: {
                        tickFormat: function(d){
                            return dateUtil.formatTimeFromTimestamp(d);
                        },
                        axisLabelDistance: 50
                    },
                    yAxis: {
                        tickFormat: function(d){

                            if(d == 0) {
                                return 0;
                            }
                            else if(d > 1000000) {
                                return d3.format('f')(d)
                            }
                            else if(d < 1) {
                                return d3.format('.10f')(d);
                            }
                            else {
                                return d3.format('.02f')(d);
                            }
                        },
                        axisLabelDistance: 50
                    }
                }
            };

            var seriesName = me.chartName;

            if(me.chartDataUnit) {
                seriesName += ' (' + me.chartDataUnit + ')';
            }

            me.chartData = [
                {
                    area: true,
                    values: result,
                    key: seriesName
                }
            ];
        };
    }

})();
