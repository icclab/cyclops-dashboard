(function () {
    /*
     Module Setup
     */
    angular.module('dashboard.registration')
        .controller('RegistrationController', RegistrationController);

    /*
     Controllers, Factories, Services, Directives
     */
    RegistrationController.$inject = [
        '$location', 'restService', 'alertService'
    ];
    function RegistrationController($location, restService, alertService) {
        var me = this;
        this.user = '';
        this.pwd = '';
        this.realName = '';
        this.surname = '';
        this.email = '';
        //this.admin = '';

        /**
         * This method redirects to the login page.
         */
        this.showLogin = function () {
            $location.path("/login");
        };

        /*
         * Private callback function. Will be called if the register fails.
         *
         */
        var registerSuccess = function () {
            alertService.showSuccess("Your user has successfully been created.");
        };

        /**
         * This method delegates to the rest service to insert the new user in the db.
         *
         */
        this.register = function () {
            restService.sendRegister(me.user, me.pwd, me.realName, me.surname, me.email, '') //, me.admin)
                .then(registerSuccess).then(me.showLogin);
        };
    };
})();
