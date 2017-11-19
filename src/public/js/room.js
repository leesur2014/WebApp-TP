$(function() {
    $.get( "/api/me", function( data ) {
        console.log('[INFO] "/api/me" responses: ' + JSON.stringify(data));
        console.log('[INFO]nickname: ' + data['nickname']);
        $('.name_container').html(data.nickname);

       // display: if the user is in a room
        if (data.room_id) {
            console.log('[INFO] This user is in room' + data.room_id);
            var room_display = 'This is room ' + data.room_id;
            $('.room_id_container').html(room_display);
        } else {
            alert("Your are not in any room!\n Now you will be redirected to game center");
            location.href = '/game-center';
        }

        $.get('/api/room', function(data) {
            if (data.code == 0) {
                 console.log('[INFO] Room info: ' + JSON.stringify(data));
                 list_players = [];
                 list_observers = [];
                 var users = data.data.users;
                 /* list all players and observers in this room */
                 for (var i = 0; i < users.length; ++i) {
                    if (users[i].observer == false) {
                        list_players.push(users[i]);
                    } else {
                        list_observers.push(users[i]);
                    }
                 }

                 if (list_players.length > 0) {

                    var dom_players = $('<ul/>').addClass('list-group');
                    for (var i in list_players)
                        dom_players.append($('<li/>').html(list_players[i].nickname).attr('id', list_players[i].id).addClass("list-group-item list-group-item-action list-group-item-success"));
                    $('#side_bar .players_container').append(dom_players);
                 }

                  if (list_observers.length > 0) {

                     var dom_obs= $('<ul/>').addClass('list-group');
                     for (var i in list_observers)
                         dom_obs.append($('<li/>').html(list_observers[i].nickname).attr('id', list_observers[i].id).addClass("list-group-item list-group-item-action"));
                     $('#side_bar .observers_container').append(dom_obs);
                  }
            } else {
                alert('[ERROR] Cannot get this room information');
            }
        });

        var token = data.token;

        console.log('[INFO]token: ' + token);
        var socket = io('/room?token='+ token);
        // Listen events: If a user enter or exit this room, update the page in real-time
        socket.on('user_enter', function(msg) {

            console.log('[INFO] User enter: ' + JSON.stringify(msg));
            $.get('/api/user/' + msg.user_id, function(data) {
                if (data.code == 0) {
                    if (data.data.observer == false) {
                        $('#side_bar .players_container ul').prepend($('<li/>').html(data.data.nickname).attr('id', data.data.id).addClass("list-group-item list-group-item-action list-group-item-success"));
                    } else {
                        $('#side_bar .observers_container ul').prepend($('<li/>').html(data.data.nickname).attr('id', data.data.id).addClass("list-group-item list-group-item-action"));
                    }
                } else {
                    alert('[ERROR] Cannot get the user info');
                }
            });

        });

        socket.on('user_exit', function(msg) {
            console.log('[INFO] User exit: ' + JSON.stringify(msg));
            $('#' + msg.user_id).remove();
        });
    });
});

function is_gaming(round_id) {
    $('#ready_bar').empty();
    $('')
}

function get_ready() {
    $('#ready_bar').empty();

}

function get_unready() {
    $('#ready_bar').empty();

}


$('#logOutButton').click(function() {
    $.post( "/api/exit", function( data ) {
        console.log('data: ' + JSON.stringify(data));
        if (data.code == 0) {
            location.href = '/game-center';
        } else {
            console.log('[ERROR]' + data.error);
            var r = confirm("It seems that you can't exit the room normally for now. Do you still want to exit?");
            if (r == true) {
                $.post("/api/exit", {force: "No"}, function(data) {
                    console.log('data: ' + JSON.stringify(data));
                    if (data.code == 0) {
                        location.href = '/game-center';
                        alert('[ERROR]' + data.error);
                    }
                });
            } else {
                // return to the room, no state change
            }
        }
    });
})