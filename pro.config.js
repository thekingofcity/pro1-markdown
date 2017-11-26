angular.module('pro').
    config(["$routeProvider",function($routeProvider) {
        $routeProvider.
            when('/Main',{
            templateUrl:"main/main.template.html",
            controller:"main"
        }).when('/highlightjs',{
            templateUrl:"highlightjs/highlightjs.template.html",
            controller:"highlightjs"
        }).when('/New',{
            templateUrl:"new.template.html",
            controller:"new"
        }).when('/Download',{
            templateUrl:"download.template.html",
            controller:"download"
        }).otherwise('/Main');
}]);
