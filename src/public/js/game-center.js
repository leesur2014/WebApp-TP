$(function() {
    $.get("/api/me", function(data) {
        console.log('[INFO] "/api/me" responses: ' + JSON.stringify(data));
        var token = data.token;
        console.log('[INFO]token: ' + token);
        var socket = io('/lounge?token='+ token);
        socket.on('room_create', function(msg) {console.log(msg);});
        socket.on('room_change', function(msg) {console.log(msg);});
        socket.on('room_delete', function(msg) {console.log(msg);});
    });
    $.get('/api/lounge', function(data) {
        console.log('[INFO]all the rooms: ' + JSON.stringify(data));
        var l = data['data'].length;
        for (var i = 0; i < l; ++i) {
            console.log(JSON.stringify(data['data'][i]));
            var room = $('<div/>');
            room.append(document.createTextNode(data['data'][i].user_count));
            var node = document.createElement("div");
            var player_count = data['data'][i].user_count;
            node.innerHTML = "<img src=\"/static/images/game-table/"+String(player_count)+".png\" class=\"img\">";
            room.click(function() {
                console.log('enter room!');
                window.location.href = "/join-room";
            });
            room.append(node);
            $('#roomContainer').append(room);           
        }
    })
    .fail(function() {
        alert( "error" );
    });
});
