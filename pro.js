var pro = angular.module('pro', [
    "ngSanitize",
    "ngRoute"
]);

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
    $rootScope.trustHtml = "start here...";
    $scope.text0 = [];
    $scope.newString = "start here...";
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
        function isEmpty(str) {
            if (str == "" || str == "<br/>") {
                return true;
            } else {
                return false;
            }
        }
        //var text = $scope.newString.replace(/\n/g, '<br/>\n').split(/\n/g);
        var text = $scope.newString.split(/\n/g);
        function processing(start, end) {
            var title = "", code = false, strong, em, href, img;
            var ulist = false, olist = false, list = false;//refer to    List contains paragraph Feature
            for (var i = start; i <= end; i++) {
                //Some disgust code to end list
                if (list) {//variable list refer to that there is indent in following lines so </li> shouldn't be placed
                    if (text[i - 1] == "<br/>" && !(isEmpty(text[i]) || text[i].match(/^\s{4}./))) {
                        list = false;
                        text[i - 1] = text[i - 1] + "</li>";
                    }
                }
                //add </ul></ol> when next line isn't in list and has <ul><ol> above
                if (!list && ulist && !text[i].match(/^\*[ ]/)) {
                    ulist = false;
                    text[i - 1] = text[i - 1] + "</ul>";
                }
                if (!list && olist && !text[i].match(/^[0-9]\./)) {
                    olist = false;
                    text[i - 1] = text[i - 1] + "</ol>";
                }

                // > blackquote
                if (text[i].match(/^>/)) {
                    var j = i;
                    while (j < text.length && text[j].match(/^>/)) {
                        text[j] = text[j].substr(1);//delete the first > character
                        j++;
                    }//determine to which line has the blackquote
                    processing(i, --j);//all the lines between i and --j are origin lines without the first > character
                    text[i] = "<blockquote>" + text[i];
                    text[j] = text[j] + "</blockquote>";
                    i = j;
                    continue;
                }
                // > blackquote

                // ' code
                if (code) {//if there is <code> above
                    if (!text[i].match(/^[ ]{4}/)) {//if this line has no indent or something else
                        text[i] = text[i] + "</code></pre>";
                        code = false;
                    } else {
                        text[i] = text[i].substr(4) + "<br/>";
                    }
                    continue;//skip the loop   doesn't change anything in <code>
                }
                if (!list && text[i].match(/^[ ]{4}/)) {//can be rewritten as !code&&text[i].match(/[ ]{4}/)
                    //adding !list&& to avoid <code> in list
                    if (!code) {//if this line was indented and there is no <code> above
                        text[i] = "<pre><code>" + text[i].substr(4) + "<br/>";
                    }
                    code = true;
                    continue;
                }
                // ' code

                // # Title
                title = text[i].match(/^#{1,6}/);
                if (title) {
                    text[i] = text[i].replace(/#{1,6}/, "<h" + title.length + ">") + "</h" + title.length + ">";
                }
                if (text[i].match(/^=+/)) {
                    if (i - 1 >= start) { text[i - 1] = "<h1>" + text[i - 1] + "</h1>"; text[i] = ""; continue; }
                }
                if (text[i].match(/^-+/)) {
                    if (i - 1 >= start && (!isEmpty(text[i - 1]))) { text[i - 1] = "<h2>" + text[i - 1] + "</h2>"; text[i] = ""; continue; }
                }
                // # Title

                // *** dividing line
                if (text[i].match(/^(\*+[ ]*?){3,}/) || text[i].match(/^(\-+[ ]*?){3,}/)) {
                    text[i] = "<hr>";
                    continue;
                }
                // *** dividing line

                // */[0-9]. list
                if (text[i].match(/^\*[ ]/) || text[i].match(/^[0-9]\./)) {
                    //if there is no <ul><ol> above add <ul><ol>
                    if (ulist) {
                        text[i] = text[i].replace(/^\*[ ]/, "<li>");
                    }
                    else if (olist) {
                        text[i] = text[i].replace(/^[0-9]\./, "<li>");
                    } else {
                        if (text[i].match(/^\*[ ]/)) {
                            text[i] = "<ul>" + text[i].replace(/^\*[ ]/, "<li>");
                            ulist = true;
                        } else {
                            text[i] = "<ol>" + text[i].replace(/^[0-9]\./, "<li>");
                            olist = true;
                        }
                    }
                    /* List contains paragraph Feature
    
                     *   This is a list item with two paragraphs.
    
                     This is the second paragraph in the list item. You're
                     only required to indent the first line. Lorem ipsum dolor
                     sit amet, consectetuer adipiscing elit.
    
                     *   Another item in the same list.
    
                     The following code enables gramma above.
                     Variable list shows whether there are more lines in this list
                     */
                    var j = i; list = true;
                    if (isEmpty(text[i + 1])) {//*words\nwords
                        while (j < text.length - 1) {//traverse until the line is indented, then set list=true
                            if (isEmpty(text[j + 1])) {//*words\n\nwords
                                j++;
                            }
                            else {
                                if (!text[j + 1].match(/^\s{4}./)) list = false;//line starts without indent
                                if (text[i + 1].match(/^\*[ ]/) || text[i + 1].match(/^[0-9]\./)) list = false;//line starts without * or [0-9]\.
                                break;
                                //if line starts with indent or */[0-9] then list=true
                            }
                        }
                    }
                    //Feature List contains paragraph end here
                    if (list == false || i == text.length - 1) {
                        text[i] = text[i] + "</li>";//Add </li> in the end
                    }
                    // */[0-9]. list

                }

                // * strong
                strong = text[i].match(/\*\*[^*]+?\*\*/);
                if (strong) {
                    for (var j = 0; j < strong.length; j++) {
                        text[i] = text[i].replace(strong[j], "<b>" + strong[j].substr(2, strong[j].length - 4) + "</b>")
                    }
                }
                // * strong

                // * emphasize
                // while(text[i].match(/\*.*?\*/)){
                //     text[i] = text[i].replace(/(?=\*).*?(?=\*)/,"<em>$&</em>");
                // }
                em = text[i].match(/\*[^*]+?\*/g);
                if (em) {
                    for (var j = 0; j < em.length; j++) {
                        text[i] = text[i].replace(em[j], "<em>" + em[j].substr(1, em[j].length - 2) + "</em>")
                    }
                }
                // * emphasize

                // []() href
                href = text[i].match(/\!*\[.*?\]\(.*?\)/)
                if (href) {
                    var link, text_, title;
                    for (var j = 0; j < href.length; j++) {
                        //if(href[j].charAt(0)=="!"){href[j]=href[j].substr(1);}
                        link = href[j].match(/\(.*?\)/);
                        link = link[0].substr(1, link[0].length - 2);
                        text_ = href[j].match(/\[.*?\]/);
                        text_ = text_[0].substr(1, text_[0].length - 2);
                        title = link.substr(link.indexOf(" ")).match(/".*?"/);
                        if (title) {
                            link = link.substr(0, link.indexOf(" "));
                            title = title[0];
                            text[i] = text[i].replace(href[j], "<a href=" + link + " title=" + title + ">" + text_ + "</a>");
                        } else {
                            text[i] = text[i].replace(href[j], "<a href=" + link + ">" + text_ + "</a>");
                        }
                    }
                }
                // []() href

                if (isEmpty(text[i])) { text[i] = text[i] + "<br/>"; }//whether this line is empty add </br>
            }
            if (ulist) { text[end] = text[end] + "</ul>"; }
            if (olist) { text[end] = text[end] + "</ol>"; }
        }
        processing(0, text.length - 1);
        $scope.text0 = text;
        $rootScope.trustHtml = "";
        for (var i = 0; i < $scope.text0.length; i++) {
            $rootScope.trustHtml += $sce.trustAsHtml($scope.text0[i]);
        }
        //locals.set("trustHtml",$rootScope.trustHtml);
        sessionStorage.trustHtml = $rootScope.trustHtml;
        //$scope.highlight();
    };

}]);