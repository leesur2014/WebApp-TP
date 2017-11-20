$(document).ready(function() {
    $.get("/api/me", function(user) {

        $('#nickname').text(user.nickname);

        if (user.room_id != null) {
            console.log("redirect user to room page");
            window.location.pathname = '/room';
        }

        var socket = io('/lounge?token=' + user.token);
        var rooms = []; // map room id to jquery elements

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

function enter_public_room(room_id, observer) {
  var data = {
    room_id: room_id,
    observer: observer,
    passcode: ""
  };
  $.post('/api/enter', data, function(resp) {
    if (resp.code == 0) {
      window.location.href = "/room";
    } else {
      alert("An error occurred:", resp.error);
    }
  });
}

function generate_room(room) {
    var row = $('<tr>');
    var td_id = $('<td>');
    var td_players = $('<td>');
    var td_observers = $('<td>');
    var td_actions = $('<td>');

    td_id.text(room.id);
    td_players.text(room.player_count);
    td_observers.text(room.user_count - room.player_count);

    var join_as_player = $('<button>Join as player</button>');
    var join_as_observer = $('<button>Join as observer</button>');
    join_as_player.addClass("btn btn-primary btn-sm");
    join_as_observer.addClass("btn btn-success btn-sm");

    join_as_player.click(function () {
      enter_public_room(room.id, false);
    });

    join_as_observer.click(function () {
      enter_public_room(room.id, true);
    });

    if (room.round_id == null)
    {
      // there is no round in this room
      td_actions.append(join_as_player);
    }
    td_actions.append(join_as_observer);

    row.append(td_id);
    row.append(td_players);
    row.append(td_observers);
    row.append(td_actions);
    return row;
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
