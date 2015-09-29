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
        .directive('chartContainer', ChartContainerDeclaration);

    ChartContainerDeclaration.$inject = ['$compile'];
    function ChartContainerDeclaration($compile) {
        var me = this;

        this.renderCharts = function($scope, el, charts) {
            var gaugeTemplate = "<gauge-chart name='{{NAME}}' type='{{TYPE}}' unit='{{UNIT}}' class='col-lg-6'></gauge-chart>";
            var cumulativeTemplate = "<cumulative-chart name='{{NAME}}' type='{{TYPE}}' unit='{{UNIT}}' class='col-lg-6'></cumulative-chart>";

            for(var i = 0; i < charts.length; i++) {
                var chart = charts[i];
                var template = "";

                if(chart.chartType == "cumulative") {
                    template = cumulativeTemplate;
                }
                else if(chart.chartType == "gauge") {
                    template = gaugeTemplate;
                }

                var finalTmpl = template.replace("{{NAME}}", chart.name)
                    .replace("{{TYPE}}", chart.serviceType)
                    .replace("{{UNIT}}", chart.unit);

                var chartElement = $compile(finalTmpl)($scope);
                el.append(chartElement);
            }
        };

        return {
            restrict: 'E',
            template: '',
            link: function($scope, el, attr, controller) {
                el.empty();

                $scope.$on('CHART_DATA_READY', function(e, charts) {
                    me.renderCharts($scope, el, charts);
                });

                $scope.$on('CLEAR_CHARTS', function() {
                    el.empty();
                });
            }
        };
    }

})();
