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

(function(){
    /*
        Main Module Setup
    */
    angular.module('dashboard', [
      'ngAnimate',
      'ui.router',
      'ui.bootstrap',
      'toasty',
      'angular-loading-bar',
      'dashboard.services',
      'dashboard.utils',
      'dashboard.navigation',
      'dashboard.login',
      'dashboard.overview',
      'dashboard.rate',
      'dashboard.charge',
      'dashboard.keystone',
      'dashboard.bills',
      'dashboard.cloudservices',
      'dashboard.admin.meters',
      'dashboard.admin.users',
      'dashboard.admin.rate',
      'dashboard.admin.billing',
      'dashboard.charts',
      'dashboard.filter',
      'dashboard.notifications',
      'dashboard.directives',
      'dashboard.modals',
      'dashboard.registration',

    ]).config([
        '$urlRouterProvider',
        '$logProvider',
        function($urlRouterProvider, $logProvider) {
            $urlRouterProvider.otherwise("/login");
            $logProvider.debugEnabled(true);
        }
    ]).run([
        '$rootScope',
        '$state',
        '$log',
        'sessionService',
        function($rootScope, $state, $log, sessionService) {
            /**
             * This function validates each redirect. It checks if a redirect
             * needs authentication or is specified as adminOnly and compares
             * the requirements to the current user session. If a redirect
             * is not permitted, the user will be redirected to the login
             * page instead.
             */
            var validateRedirect = function(event, to, toArgs, from, fromArgs){
                if(to.authenticate && !sessionService.isAuthenticated()){
                    $log.debug("Access Violation: not authenticated");
                    $state.go("login");
                    event.preventDefault();
                }

                if(to.adminOnly && !sessionService.isAdmin()){
                    $log.debug("Access Violation: no administrator");
                    $state.go("login");
                    event.preventDefault();
                }
            };

            $rootScope.$on("$stateChangeStart", validateRedirect);
        }
    ]);

    /*
        Login Module Setup
    */
    angular.module('dashboard.login', [
        'ui.router'
    ]).config([
        '$stateProvider',
        function($stateProvider) {
            $stateProvider.state('login', {
                url: "/login",
                authenticate: false,
                adminOnly: false,
                views: {
                    "navigation": {
                        template: ''
                    },
                    "content": {
                        templateUrl: 'login/login.html',
                        controller: 'LoginController',
                        controllerAs: 'loginCtrl'
                    }
                }
            });
        }
    ]);

    /*
        Registration Module Setup
     */
    angular.module('dashboard.registration', [
        'ui.router'
    ]).config([
        '$stateProvider',
        function($stateProvider) {
            $stateProvider.state('registration', {
                url: "/registration",
                authenticate: false,
                adminOnly: false,
                views: {
                    "navigation": {
                        template: ''
                    },
                    "content": {
                        templateUrl: 'registration/registration.html',
                        controller: 'RegistrationController',
                        controllerAs: 'registrationCtrl'
                    }
                }
            });
        }
    ]);

    /*
        Overview Module Setup
    */
    angular.module('dashboard.overview', [
        'ui.router'
    ]).config([
        '$stateProvider',
        function($stateProvider) {
            $stateProvider.state('overview', {
                url: "/overview",
                authenticate: true,
                adminOnly: false,
                views: {
                    "navigation": {
                        templateUrl: 'navigation/navigation.html',
                        controller: 'NavigationController',
                        controllerAs: 'navigationCtrl'
                    },
                    "content": {
                        templateUrl: 'overview/overview.html',
                        controller: 'OverviewController',
                        controllerAs: 'overviewCtrl'
                    }
                }
            });
        }
    ]);

    /*
        Rate Module Setup
    */
    angular.module('dashboard.rate', [
        'ui.router'
    ]).config([
        '$stateProvider',
        function($stateProvider) {
            $stateProvider.state('rate', {
                url: "/rate",
                authenticate: true,
                adminOnly: false,
                views: {
                    "navigation": {
                        templateUrl: 'navigation/navigation.html',
                        controller: 'NavigationController',
                        controllerAs: 'navigationCtrl'
                    },
                    "content": {
                        templateUrl: 'rate/rate.html',
                        controller: 'RateController',
                        controllerAs: 'rateCtrl'
                    }
                }
            });
        }
    ]);

    /*
        Charge Module Setup
    */
    angular.module('dashboard.charge', [
        'ui.router'
    ]).config([
        '$stateProvider',
        function($stateProvider) {
            $stateProvider.state('charge', {
                url: "/charge",
                authenticate: true,
                adminOnly: false,
                views: {
                    "navigation": {
                        templateUrl: 'navigation/navigation.html',
                        controller: 'NavigationController',
                        controllerAs: 'navigationCtrl'
                    },
                    "content": {
                        templateUrl: 'charge/charge.html',
                        controller: 'ChargeController',
                        controllerAs: 'chargeCtrl'
                    }
                }
            });
        }
    ]);

    /*
        Keystone Module Setup
    */
    angular.module('dashboard.keystone', [
        'ui.router'
    ]).config([
        '$stateProvider',
        function($stateProvider) {
            $stateProvider.state('keystone', {
                url: "/keystone",
                authenticate: true,
                adminOnly: false,
                views: {
                    "navigation": {
                        templateUrl: 'navigation/navigation.html',
                        controller: 'NavigationController',
                        controllerAs: 'navigationCtrl'
                    },
                    "content": {
                        templateUrl: 'keystone/keystone.html',
                        controller: 'KeystoneController',
                        controllerAs: 'keystoneCtrl'
                    }
                }
            });
        }
    ]);

    /*
        Bills Module Setup
    */
    angular.module('dashboard.bills', [
        'ui.router'
    ]).config([
        '$stateProvider',
        function($stateProvider) {
            $stateProvider.state('bills', {
                url: "/bills",
                authenticate: true,
                adminOnly: false,
                views: {
                    "navigation": {
                        templateUrl: 'navigation/navigation.html',
                        controller: 'NavigationController',
                        controllerAs: 'navigationCtrl'
                    },
                    "content": {
                        templateUrl: 'bills/bills.html',
                        controller: 'BillController',
                        controllerAs: 'billCtrl'
                    }
                }
            });
        }
    ]);

    /*
        Admin Meter Configuration Module Setup
    */
    angular.module('dashboard.admin.meters', [
        'ui.router'
    ]).config([
        '$stateProvider',
        function($stateProvider) {
            $stateProvider.state('admin-meters', {
                url: "/admin/meters",
                authenticate: true,
                adminOnly: true,
                views: {
                    "navigation": {
                        templateUrl: 'navigation/navigation.html',
                        controller: 'NavigationController',
                        controllerAs: 'navigationCtrl'
                    },
                    "content": {
                        templateUrl: 'admin/meters/meters.html',
                        controller: 'AdminMeterController',
                        controllerAs: 'adminMeterCtrl'
                    }
                }
            });
        }
    ]);

    /*
        Admin User Management Module Setup
    */
    angular.module('dashboard.admin.users', [
        'ui.router'
    ]).config([
        '$stateProvider',
        function($stateProvider) {
            $stateProvider.state('admin-users', {
                url: "/admin/users",
                authenticate: true,
                adminOnly: true,
                views: {
                    "navigation": {
                        templateUrl: 'navigation/navigation.html',
                        controller: 'NavigationController',
                        controllerAs: 'navigationCtrl'
                    },
                    "content": {
                        templateUrl: 'admin/users/users.html',
                        controller: 'AdminUserController',
                        controllerAs: 'adminUserCtrl'
                    }
                }
            });
        }
    ]);

    /*
        Admin Rate Configuration Module Setup
    */
    angular.module('dashboard.admin.rate', [
        'ui.router'
    ]).config([
        '$stateProvider',
        function($stateProvider) {
            $stateProvider.state('admin-rate', {
                url: "/admin/rate",
                authenticate: true,
                adminOnly: true,
                views: {
                    "navigation": {
                        templateUrl: 'navigation/navigation.html',
                        controller: 'NavigationController',
                        controllerAs: 'navigationCtrl'
                    },
                    "content": {
                        templateUrl: 'admin/rate/rate.html',
                        controller: 'AdminRateController',
                        controllerAs: 'adminRateCtrl'
                    }
                }
            });
        }
    ]);

    /*
        Admin Billing Configuration Module Setup
    */
    angular.module('dashboard.admin.billing', [
        'ui.router'
    ]).config([
        '$stateProvider',
        function($stateProvider) {
            $stateProvider.state('admin-billing', {
                url: "/admin/billing",
                authenticate: true,
                adminOnly: true,
                views: {
                    "navigation": {
                        templateUrl: 'navigation/navigation.html',
                        controller: 'NavigationController',
                        controllerAs: 'navigationCtrl'
                    },
                    "content": {
                        templateUrl: 'admin/billing/billing.html',
                        controller: 'AdminBillingController',
                        controllerAs: 'adminBillingCtrl'
                    }
                }
            });
        }
    ]);

    /*
        Cloudservices Module Setup
    */
    angular.module('dashboard.cloudservices', [
        'ui.router'
    ]).config([
        '$stateProvider',
        function($stateProvider) {
            $stateProvider.state('cloudservices', {
                url: "/cloudservices",
                authenticate: true,
                adminOnly: false,
                views: {
                    "navigation": {
                        templateUrl: 'navigation/navigation.html',
                        controller: 'NavigationController',
                        controllerAs: 'navigationCtrl'
                    },
                    "content": {
                        templateUrl: 'cloud-services/cloud-services.html',
                        controller: 'CloudServiceController',
                        controllerAs: 'cloudServiceCtrl'
                    }
                }
            });
        }
    ]);

    /*
        Navigation Module Setup
    */
    angular.module('dashboard.navigation', []);

    /*
        Service Module Setup
    */
    angular.module('dashboard.services', []);

    /*
        Util Module Setup
    */
    angular.module('dashboard.utils', []);

    /*
        Charts Module Setup
    */
    angular.module('dashboard.charts', ['nvd3']);

    /*
        Filter Module Setup
    */
    angular.module('dashboard.filter', []);

    /*
        Notifications Module Setup
    */
    angular.module('dashboard.notifications', []);

    /*
        Directives Module Setup
    */
    angular.module('dashboard.directives', []);

    /*
        Modals Module Setup
    */
    angular.module('dashboard.modals', []);

    /*
        Register Module Setup
    */
    //angular.module('dashboard.registration',[]);
})();
