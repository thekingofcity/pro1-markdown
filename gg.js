var g=angular.module('gg',[]);
g.controller('myCtrl',function($scope){


    $scope.isValid=1;

    $scope.newString='';
    $scope.count=0;
    $scope.fresh=function(){
        function judge(s,a){
            $scope.count=0;
            for (i=0;i<s.length;i++){
                if (s[i]==a)
                   $scope.count++;
            }
            if ($scope.count >0) return 0;
            return 1;
        }
        $scope.isValid=judge($scope.newString,'a');
    };

});
