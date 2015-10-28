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

    angular.module('dashboard.directives')
        .directive('dateSpanSelection', DateSpanSelectionDeclaration);

    function DateSpanSelectionDeclaration() {
        return {
            scope: {
              "onDateChanged": "&"
            },
            restrict: 'E',
            templateUrl: 'directives/date-span-selection/date-span-selection.html',
            link: onLink
        };
    }

    function onLink(scope, el, attr, controller) {
        scope.dateFormat = attr.dateFormat;
        scope.defaultValue = attr.defaultValue;

        scope.$watchGroup(['fromDate', 'toDate'], function(newValues, oldValues) {

            //Don't fire event if no dates have been changed
            if(angular.equals(newValues, oldValues)) {
                return;
            }

            //https://docs.angularjs.org/guide/directive#creating-a-directive-that-wraps-other-elements
            scope.onDateChanged({
                'from': scope.fromDate || scope.defaultValue,
                'to': scope.toDate || scope.defaultValue
            });
        });

        scope.openFromDatePicker = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            scope.fromPickerOpen = true;
        };

        scope.openToDatePicker = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            scope.toPickerOpen = true;
        };
    }

})();
