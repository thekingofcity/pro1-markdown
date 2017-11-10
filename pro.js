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
        function isEmpty(str) {
            if (str == "") {
                return true
            } else {
                return false
            }
        }
        //var text = $scope.newString.replace(/\n/g, '<br/>\n').split(/\n/g);
        var ulist = false, olist = false, list = false;//refer to    List contains paragraph Feature
        var text = $scope.newString.split(/\n/g);
        for (var i = 0; i < text.length; i++) {
            //Some disgust code to end list
            if (list) {//variable list refer to that there is indent in following lines so </li> shouldn't be placed
                if (text[i - 1] == "<br/>" && !(isEmpty(text[i]) || text[i].match(/^\s{4}./))) {
                    list = false;
                    text[i - 1] = text[i - 1] + "</li>";
                }
            }
            if (!list && ulist && !text[i].match(/^\*[ ]/)) {
                ulist = false;
                text[i] = "</ul>" + text[i];
            }
            if (!list && olist && !text[i].match(/^[0-9]\./)) {
                olist = false;
                text[i] = "</ol>" + text[i];
            }
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
            var strong = text[i].match(/\*\*.*?\*\*/g);
            if (strong) {
                for (var j = 0; j < strong.length; j++) {
                    text[i] = text[i].replace(strong[j], "<b>" + strong[j].substr(2, strong[j].length - 4) + "</b>")
                }
            }
            // * strong

            // * emphasize
            var em = text[i].match(/\*.*?\*/g);
            if (em) {
                for (var j = 0; j < em.length; j++) {
                    text[i] = text[i].replace(em[j], "<em>" + em[j].substr(1, em[j].length - 2) + "</em>")
                }
            }
            // * emphasize

            if (isEmpty(text[i])) { text[i] = text[i] + "<br/>"; }//whether this line is empty add </br>

        }
        $scope.text0 = text;
        $scope.trustHtml = "";
        for (var i = 0; i < $scope.text0.length; i++) {
            $scope.trustHtml += $sce.trustAsHtml($scope.text0[i]);
        }
    }

}]);