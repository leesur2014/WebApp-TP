$(function() {
    var token = $('#user-token').val();
    var socket = io('/lounge?token=' + token);
    var rooms = []; // map room id to jquery elements

    socket.on('room_create', function(msg) {
        var room_id = msg.room_id;
        $.get('/api/room/' + room_id, function(resp) {
            rooms[room_id] = generate_room(resp.data);
            $('#room-container').prepend(rooms[room_id]);
            console.log("added room", room_id);
        });
    });

    socket.on('room_change', function(msg) {
        var room_id = msg.room_id;
        if (rooms[room_id])
        {
          // update only if the room id is in the rooms array
          $.get('/api/room/' + room_id, function(resp)
          {
              var new_element = generate_room(resp.data);
              rooms[room_id].replaceWith(new_element);
              rooms[room_id] = new_element;
              console.log("updated room", room_id);
          });
        }
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

    socket.on('reconnecting', function (attempt) {
      show_alert(`Connection lost. Reconnecting #{attempt}...`);
    });

    socket.on('reconnect_failed', function (attempt) {
      show_alert("Reconnection failed. Please check your network and refresh the page.");
    });

    socket.on('reconnect', function (attempt) {
      hide_alert();
    });

    // populate the rooms array
    $.get('/api/lounge', function(resp) {
        for (var i = 0; i < resp.data.length; ++i)
        {
            var room = rooms[resp.data[i].id] = generate_room(resp.data[i]);
            $('#room-container').prepend(room);
        }
    })
    .fail(function() {
        alert("Failed to fetch the public room list");
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
          location.reload();
      } else {
          alert("Error: " + resp.error);
      }
  });
}

function generate_room(room) {
    var row = $('<div/>');
    var panel_head = $('<div/>').addClass('panel-heading');
    var panel_body = $('<div/>').addClass('panel-body');
    panel_head.html('Room ' + room.id);

    var btn_player = $('<div/>').html('Players: ' + room.player_count);
    var btn_observer = $('<div/>').html('Observers: ' + (room.user_count - room.player_count));

    var join_as_player = $('<button/>').html('player').addClass('btn btn-success btn-sm');
    var join_as_observer = $('<button/>').html('observer').addClass('btn btn-default btn-sm');
    var join_actions = $('<div/>').addClass('btn-group btn-group-sm');
    var panel_foot = $('<div/>').addClass('panel-footer').html('Join as &nbsp;');

    join_as_player.click(function () {
        enter_public_room(room.id, false);
    });

    join_as_observer.click(function () {
        enter_public_room(room.id, true);
    });

    if (room.round_id == null)
    {
        // there is no round in this room, you can join as a player OR observer
        row.addClass('panel panel-success room-panel');
    } else {
        // You can only join as an observer
        join_as_player.prop("disabled", true);
        row.addClass('panel panel-default room-panel');
    }
    join_actions.append(join_as_player);
    join_actions.append(join_as_observer);

    row.append(panel_head);
    panel_body.append(btn_player);
    panel_body.append(btn_observer);
    row.append(panel_body);
    panel_foot.append(join_actions);
    row.append(panel_foot);
    return row;
}


function show_alert(msg) {
  var el = $("<p>").text(msg);
  var div = $("#alert-div");
  div.empty();
  div.append(el);
  div.show();
}

function hide_alert() {
  $("#alert-div").hide();
}
