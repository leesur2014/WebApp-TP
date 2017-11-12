$(function() {
    var node = document.createElement("div");
    var player_count = 4;//data['data'][i].user_count;
    node.innerHTML = "<img src=\"/static/images/game-table/"+String(player_count)+".png\" class=\"img\">";
    var text = document.createElement("div");
    var room_id = 1;
    text.innerHTML = "<a id=\"room_id\">Room"+String(room_id)+"</a>";
    node.append(text);
    $('#roomContainer').append(node); 
    /*
    $.get('/api/lounge', function(data) {
        console.log(JSON.stringify(data));
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
    */
});

