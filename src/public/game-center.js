angular.module('gameCenter',[]);

function gameCenterController($scope, $http, $window) {
    $http.get('/api/lounge')
        .success(function(data) {
            $scope.rooms = data.data;
            images = [];
            //$scope.images = ["/static/images/game-table/6.png","/static/images/game-table/1.png"];
            console.log($scope.images);
            var roomsInfo = data.data;
            var images = [];
            var path1 = "/static/images/game-table/";
            var path2 = ".png";
            for(var i=0;i<roomsInfo.length;i++) {
                var player_count = roomsInfo[i]['player_count'];
                images.push(path1+String(player_count)+path2);
            }
            $scope.images = images;
        })
        .error(function(data) {
            console.log("Error, invalid input.");
        })

    $scope.joinRoom = function() {
        $window.location.href = '/static/join-room.html';
    };

    $scope.createRoom = function() {
        $window.location.href = '/static/create-room.html';
    };
}