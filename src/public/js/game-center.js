$(document).ready(function() {
    $.get("/api/me", function(user) {

        $('#nickname').text(user.nickname);

        if (user.room_id != null) {
            console.log("redirect user to room page");
            window.location.pathname = '/room';
        }

        var socket = io('/lounge?token=' + user.token);

        socket.on('room_create', function(msg) {
            var room_id = msg.room_id;
            $.get('/api/room/' + room_id, function(resp) {
                $('#room-table').prepend(generate_room(resp.data));
            });
        });

        socket.on('room_change', function(msg) {
            var room_id = msg.room_id;
            // add a new room
            $.get('/api/room/' + room_id, function(resp) {
                $('#room-table').prepend(generate_room(resp.data));
            });
        });

        socket.on('room_delete', function(msg) {
          var room_id = msg.room_id;

        });
    });

    $.get('/api/lounge', function(data) {
        var l = data.data.length;
        for (var i = 0; i < l; ++i) {
            var room = generate_room(data.data[i]);
            $('#room-table').prepend(room);
        }
    })
    .fail(function() {
        alert("Failed to fetch the public room list");
    });
});

function generate_room(entry) {
    var room = $('<tr>');
    var td_id = $('<td>');
    var td_players = $('<td>');
    var td_observers = $('<td>');
    var td_actions = $('<td>');

    td_id.text(entry.id);
    td_players.text(entry.player_count);
    td_observers.text(entry.user_count - entry.player_count);

    var join_as_player = $('<button>Join as player</button>');
    var join_as_observer = $('<button>Join as observer</button>');
    join_as_player.addClass("btn btn-primary btn-sm");
    join_as_observer.addClass("btn btn-success btn-sm");

    if (entry.round_id == null)
    {
      td_actions.append(join_as_player);
    }
    td_actions.append(join_as_observer);

    room.append(td_id);
    room.append(td_players);
    room.append(td_observers);
    room.append(td_actions);
    return room;
}
