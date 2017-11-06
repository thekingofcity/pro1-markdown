var g=angular.module('nav',[
    'ui.bootstrap',
    'ngRoute'
]);

g.config(['$routeProvider', '$locationProvider', '$sceProvider', function ($routeProvider, $locationProvider, $sceProvider) {
    $routeProvider
        .when('/', {controller: 'myCtrl'})
        .when('/new', {controller: 'myCtrl'})
        .when('/download', {controller: 'myCtrl'})
        .otherwise({redirectTo: '/'});
    $locationProvider.html5Mode(true);
}]);






g.controller('NavbarCtrl', function ($scope, $location) {
    $scope.isActive = function (route) {
        return route === $location.path();
    }
});
