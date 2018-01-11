var str = "start here...";

var pro = angular.module('pro', [
    "ngSanitize",
    "ngRoute",
    "ngCookies",
    'ngMaterial',
    'ngMessages',
    'material.svgAssetsCache'
]);

pro.factory("notifyService", function () {
    var target = {
        search: "key"
    };

    return target;
});

// http://blog.csdn.net/liubinwyzbt/article/details/52330504
pro.directive('resize', function ($window) {
    return function (scope, element) {
        var w = angular.element($window);
        scope.getWindowDimensions = function () {
            //return { 'h': w.height(), 'w': w.width() };
            return { 'h': window.innerHeight, 'w': window.innerWidth };
        };
        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
            scope.windowHeight = newValue.h;
            //scope.windowWidth = newValue.w;
            scope.style = function () {
                return { 
                    'height': (newValue.h - 130) + 'px'
                    //'width': (newValue.w ) + 'px' 
                };
            };

        }, true);

        w.bind('resize', function () {
            scope.$apply();
        });
    }
})

// http://blog.csdn.net/sinat_31057219/article/details/70212939
pro.factory('locals', ['$window', function ($window) {
    return {        //存储单个属性
        set: function (key, value) {
            $window.localStorage[key] = value;
        },        //读取单个属性
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },        //存储对象，以JSON格式存储
        setObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);//将对象以字符串保存
        },        //读取对象
        getObject: function (key) {
            return JSON.parse($window.localStorage[key] || '{}');//获取字符串并解析成对象
        }

    }
}]);

pro.controller('main', ["$scope", "$sce", '$http', '$rootScope', 'notifyService', '$log', 'locals', '$cookies', '$mdDialog', function ($scope, $sce, $http, $rootScope, notifyService, $log, locals, $cookies, $mdDialog) {

    $rootScope.notify = notifyService;
    $scope.newString = "start here...";
    $scope.loginFailed = false;
    $scope.dic = new Array();
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
        console.log($scope.newString);
        locals.set("newString", $scope.newString);
        dic = new Array();
        var text = $scope.newString.split(/\n/g);
        var wholeText_ = "";

        wholeText_ = processing(text, wholeText_, 0, text.length - 1);
        $rootScope.trustHtml = wholeText_;
    };

    $scope.status = '  ';
    $scope.customFullscreen = false;
  
    $scope.showLogin = function (ev) {
        $mdDialog.show({
            controller: DialogController,
            templateUrl: 'login.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
            .then(function (answer) {
                //$scope.status = 'You said the information was "' + answer + '".';
                tmp = answer.split(" ");
                $scope.login(tmp[0], tmp[1]);
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });
    };

    function DialogController($scope, $mdDialog) {
      $scope.hide = function() {
        $mdDialog.hide();
      };
  
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
  
      $scope.answer = function(answer) {
        $mdDialog.hide(answer);
      };
    }

    $scope.login = function (username, password) {
        // https://stackoverflow.com/questions/13741533/angularjs-withcredentials <-- save CROS cookies
        var hash = CryptoJS.SHA256(password);
        hash = hash.toString(CryptoJS.enc.Hex);
        // https://stackoverflow.com/questions/11889329/word-array-to-string
        $http.post(
            'http://127.0.0.1:5000/login', { name: username, password: hash }, { withCredentials: true },
        ).then(function successCallback(resp) {
            console.log(resp.data);
            if (resp.data.indexOf("success") >= 0) {
                $scope.displayName = username;
                //$scope.username = "";
                //$scope.password = "";
                $scope.isLogin = true;
            } else if (resp.data.indexOf("fail") >= 0) {
                $scope.loginFailed = true;
            }
        }, function errorCallback(resp) {
            console.log(resp);
        });
    }
    $scope.logout = function() {
        $cookies.remove('name');
        $cookies.remove('UID');
        $scope.displayName = "Not login yet."
        $scope.isLogin = false;
    }
    $scope.refreshDueToCookie = function(){
        if($cookies.get('name')){
            $scope.displayName = $cookies.get('name')
            //if($scope.isLogin){$scope.dltext();}
            $scope.dltext();
            $scope.isLogin = true;
        }else{
            $scope.displayName = "Not login yet."
            $scope.isLogin = false;
        }
        console.log($scope.newString);
    }
    $scope.dltext = function(){
        $http.post(
            'http://127.0.0.1:5000/dltext', { UID: $cookies.get('UID'), docID: 10000 }, {withCredentials: true},
        ).then(function successCallback(resp) {
            $scope.newString = resp.data;
            $scope.refresh();
        },function errorCallback(resp) {
            console.log(resp);
        });
    }
    $scope.refreshDueToCookie();
    $scope.refresh();

}]);
