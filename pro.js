var str = "start here...";

var pro = angular.module('pro', [
    "ngSanitize",
    "ngRoute",
    "hljs"
]);

pro.config(function (hljsServiceProvider) {
    hljsServiceProvider.setOptions({
    // replace tab with 4 spaces
    tabReplace: '    '
    });
});

pro.controller('download', ['$scope', 'http', function ($scope, $http) {
}]);

pro.controller('new', ['$scope', '$http', function ($scope, $http) {
}]);


pro.factory("notifyService", function () {
    var target = {
        search: "key"
    };

    return target;
});

// https://my.oschina.net/furw/blog/663566
// doesn't work
pro.factory('locals', ['$window', function ($window) {
    return {        //存储单个属性
        set: function (key, value) {
            $window.localStorage[key] = value;
        },        //读取单个属性
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },        //存储对象，以JSON格式存储
        setObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },        //读取对象
        getObject: function (key) {
            return JSON.parse($window.localStorage[key] || '{}');
        }

    }
}]);

pro.controller('main', ["$scope", "$sce", '$http', '$rootScope', 'notifyService', '$log', function ($scope, $sce, $http, $rootScope, notifyService, $log, locals) {
    $rootScope.notify = notifyService;
    $scope.newString = str;
    $scope.dic=new Array();
    $scope.highlight = function () {
        $scope.refresh();
        //$log.info("text: " + $rootScope.trustHtml);
        //$log.info("search: " + $rootScope.notify.search);
        if (!$rootScope.notify.search) {
            return;
        }
        // if ($rootScope.notify.search == "") {
        //     $rootScope.trustHtml = sessionStorage.trustHtml;
        //     return;
        // }
        //var text = encodeURI(sessionStorage.trustHtml);
        var text = encodeURI($scope.newString);
        var search = encodeURI($rootScope.notify.search);

        var regex = new RegExp(search, 'gi');
        var result = text.replace(regex, '<span class="highlightedText">$&</span>');
        result = decodeURI(result);
        //$log.info("result: " + result );
        var temp = $scope.newString;
        $scope.newString = result;
        $scope.refresh();
        $scope.newString = temp;

        //$rootScope.trustHtml = $sce.trustAsHtml(result);
        return;

    };
    $scope.refresh = function () {
        str = $scope.newString;
        dic=new Array();
        //var text = $scope.newString.replace(/\n/g, '<br/>\n').split(/\n/g);
        var text = $scope.newString.split(/\n/g);
        var wholeText_ = "";

        wholeText_ = processing(text, wholeText_, 0, text.length - 1);
        $rootScope.trustHtml = wholeText_;

        //locals.set("trustHtml",$rootScope.trustHtml);
        sessionStorage.trustHtml = $rootScope.trustHtml;
        //$scope.highlight();
    };
    $scope.refresh();

}]);

pro.controller('highlightjs', ["$scope", "$sce", '$http', '$rootScope', 'notifyService', '$log', function ($scope, $sce, $http, $rootScope, notifyService, $log, locals) {
    $rootScope.notify = notifyService;
    $scope.newStringHighlightJs = str;
    $scope.refreshHighlightJs = function () {
        str = $scope.newStringHighlightJs;
        $rootScope.outputHighlightJs = $scope.newStringHighlightJs;
    };
    $scope.refreshHighlightJs();

}]);