//angular.module('createRoom',[]);
//
//function createRoomController($scope, $http, $window) {
//    $scope.formData = {};
//
//    $scope.createRoom = function() {
//        //console.log($scope.formData);
//        $http.post('/room', $scope.formData);
//        $window.history.back();
//    };
//}

$(document).ready(function() {
    var passcode = $("#passcode").value;
    $("#form-create").click(function() {
        console.log(passcode);
        location.href=('http://127.0.0.1:3000/static/html/room.html');
        //$.post('/api/room', {'passcode':passcode})
        // .done(function(data) {
        //     $.get('http://127.0.0.1:3000/static/html/room.html');
        // }) 
        //.fail(function() {
        //alert("Error");
        //});
    })  
    
});