$(function() {
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
                window.location.href = "/join-room";
            });
            $('#roomContainer').append(room);           
            $('#roomContainer').append(node);
        }
    })
    .fail(function() {
        alert( "error" );
    });
});