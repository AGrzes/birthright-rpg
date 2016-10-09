angular.module('birthright', ['ui.router'])

.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/sample');

    $stateProvider.state('sample', {
        url: '/sample',
        templateUrl: 'fragments/sample.html'
    });


});
