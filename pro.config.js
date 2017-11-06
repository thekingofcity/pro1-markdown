angular.module('pro').
    config(["$routeProvider",function($routeProvider) {
    $routeProvider.
        when('/Main',{
        templateUrl:"main.template.html",
        controller:"main"
    }).when('/New',{
        templateUrl:"new.template.html",
        controller:"new"
    }).when('/Download',{
        templateUrl:"download.template.html",
        controller:"download"
    }).otherwise('/Main')
}]);
