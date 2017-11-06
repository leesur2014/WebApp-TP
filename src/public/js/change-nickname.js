angular.module('changeNickname',[]);

function changeNickNameController($scope, $http) {
    $scope.formData = {};   
    $scope.changeNickname = function() {
        //console.log($scope.formData);
        $http.post('/api/me', $scope.formData);
    };
}