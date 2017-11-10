var pro = angular.module('pro', [
    "ngSanitize",
    "ngRoute"
]);

pro.controller('download', ['$scope', 'http', function ($scope, $http) {

}]);

pro.controller('new', ['$scope', '$http', function ($scope, $http) {
}]);

pro.controller('main', ["$scope", "$sce", '$http', function ($scope, $sce, $http) {
    $scope.trustHtml = "start here...";
    $scope.text0 = [];
    $scope.newString = "start here...";
    $scope.refresh = function () {
        //var text = $scope.newString.replace(/\n/g, '<br/>\n').split(/\n/g);
        var ulist = false, olist = false;
        var text = $scope.newString.split(/\n/g);
        for (var i = 0; i < text.length; i++) {
            // # Title
            if (text[i].match(/^#{1}/)) {
                if (text[i].match(/^#{2}/)) {
                    if (text[i].match(/^#{3}/)) {
                        if (text[i].match(/^#{4}/)) {
                            if (text[i].match(/^#{5}/)) {
                                if (text[i].match(/^#{6}/)) {
                                    text[i] = text[i].replace(/#{6}/, "<h6>");
                                } else {
                                    text[i] = text[i].replace(/#{5}/, "<h5>");
                                }
                            } else {
                                text[i] = text[i].replace(/#{4}/, "<h4>");
                            }
                        } else {
                            text[i] = text[i].replace(/#{3}/, "<h3>");
                        }
                    } else {
                        text[i] = text[i].replace(/#{2}/, "<h2>");
                    }
                } else {
                    text[i] = text[i].replace(/#{1}/, "<h1>");
                }
                text[i] = text[i].replace(/#{0,}$/, "") + "</h" + text[i].charAt(2) + ">";
            }
            // var regAtx=/^#/;
            // if(text[i].match(regAtx)){
            //     for(var j=1;j<6;j++){
            //         if(text[i].charAt(j)!="#"){break;}
            //     }
            //     text[i]="<h"+j+">"+text[i].substr(j);
            //     for(j=text[i].length-1;j>=text[i].length-6;j--){
            //         if(text[i].charAt(j)!="#"){break;}
            //     }
            //     text[i]=text[i].substr(0,j)+"</h"+j+">";
            // }
            // # Title

            // * Unordered List
            if (text[i].match(/^\*/)) {
                if (ulist) {//if there is list<ul> above
                    text[i] = text[i].replace(/^\*/, "<li>") + "</li>";
                } else {//add <ul> at the beginning
                    text[i] = "<ul>" + text[i].replace(/^\*/, "<li>") + "</li>";
                    ulist = true;
                }
                if (i == text.length - 1) {//if this line at the bottom add </ul> directly
                    text[i] = text[i] + "</ul>";
                    ulist = false;
                } else {//read next line to see whether there is list further more
                    if (!text[i + 1].match(/^\*/)) {
                        text[i] = text[i] + "</ul>";
                        ulist = false;
                    }
                }
            }
            // * Unordered List

            // [0-9]\. Ordered List
            if (text[i].match(/^[0-9]\./)) {
                if (olist) {//if there is list<ul> above
                    text[i] = text[i].replace(/^[0-9]\./, "<li>") + "</li>";
                } else {//add <ul> at the beginning
                    text[i] = "<ol>" + text[i].replace(/^[0-9]\./, "<li>") + "</li>";
                    olist = true;
                }
                if (i == text.length - 1) {//if this line at the bottom add </ul> directly
                    text[i] = text[i] + "</ol>";
                    olist = false;
                } else {//read next line to see whether there is list further more
                    if (!text[i + 1].match(/^[0-9]\./)) {
                        text[i] = text[i] + "</ol>";
                        olist = false;
                    }
                }
            }
            // 1. Ordered List

            if (text[i] == "") { text[i] = text[i] + "<br/>"; }//whether this line is empty

        }
        $scope.text0 = text;
        $scope.trustHtml = "";
        for (var i = 0; i < $scope.text0.length; i++) {
            $scope.trustHtml += $sce.trustAsHtml($scope.text0[i]);
        }
    }

}]);