angular.module('createRoom',[]);

function createRoomController($scope, $http, $window) {
    $scope.formData = {};

    $scope.createRoom = function() {
        //console.log($scope.formData);
        $http.post('/room', $scope.formData);
        $window.history.back();
    };

    
}