$(document).ready(function() {
    $.get("/api/me", function(user) {

        $('#nickname').text(user.nickname);

        if (user.room_id != null) {
            console.log("redirect user to room page");
            window.location.pathname = '/room';
        }

        var socket = io('/lounge?token=' + user.token);
        var rooms = [];

        socket.on('room_create', function(msg) {
            var room_id = msg.room_id;
            $.get('/api/room/' + room_id, function(resp) {
                rooms[room_id] = generate_room(resp.data);
                $('#room-table').prepend(rooms[room_id]);
                console.log("added room", room_id);
            });
        });

        socket.on('room_change', function(msg) {
            var room_id = msg.room_id;
            $.get('/api/room/' + room_id, function(resp) {
              if (rooms[room_id] != null)
              {
                rooms[room_id].remove();
              }
              rooms[room_id] = generate_room(resp.data);
              $('#room-table').prepend(rooms[room_id]);
            });
        });

        socket.on('room_delete', function(msg) {
          var room_id = msg.room_id;
          if (rooms[room_id] != null)
          {
            rooms[room_id].remove();
            delete rooms[room_id];
            console.log("removed room", room_id);
          }
        });

        $.get('/api/lounge', function(resp) {
            for (var i = 0; i < resp.data.length; ++i) {
                var room = rooms[resp.data[i].id] = generate_room(resp.data[i]);
                $('#room-table').prepend(room);
            }
        })
        .fail(function() {
            alert("Failed to fetch the public room list");
        });
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


$('#create-room-form').submit(function(event) {
    event.preventDefault();
    var data = {};
    data.passcode = $('#passcode').val();
    $.post( "/api/room", data, function(resp) {
        if (resp.code == 0) {
            location.href = '/room';
        } else {
            alert('An error occurred: ' + resp.error);
        }
    });
});

$('#change-nickname-form').submit(function(event) {
    event.preventDefault();
    if ($('#nickname').val()) {
        var parameters = {'nickname': $('#nickname').val()};
        $.post( "/api/me", parameters, function( data ) {
            if (data.code == 0) {
                alert("Success");
            } else {
                alert('An error occurred: ' + data.error);
            }
        });
    } else {
      alert("Nickname should not be empty");
    }
});


$('#join-room-form').submit(function(event) {
    event.preventDefault();
    var data = {
      room_id: $('#room_id').val(),
      passcode: $('#password').val(),
      observer: $('#observer').is(":checked")
    };
    $.post("/api/enter", data, function(resp) {
      if (resp.code == 0) {
        console.log("redirect user to room page");
        location.href = '/room';
      } else {
        alert('An error occurred: ' + resp.error);
      }
    });
});
