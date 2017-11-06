angular.module('joinRoom',[]);

function joinRoomController($scope, $http, $window) {
    $scope.formData = {"isObserver":false};

    $scope.isObserver = function() {
        $scope.formData["isObserver"] = true;
    };

    $scope.joinRoom = function() {
        //console.log($scope.formData);
        $http.post('/enter', $scope.formData);
        $window.history.back();
    };

    
}