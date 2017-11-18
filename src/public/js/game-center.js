$(function() {
    $.get("/api/me", function(data) {
        console.log('[INFO] "/api/me" responses: ' + JSON.stringify(data));
        var token = data.token;
        var nickname = data.nickname;
        $('.name_container').html(nickname);
        // display: if the user is in a room
        if (data.room_id != null) {
            console.log('[INFO] This user is in room' + data.room_id);
            var link_to_room = 'You are in room ' + data.room_id + ', click <a href = "/room" > here </a> to go back to game room';
            $('.room_id_container').html(link_to_room);

        }
        var d = new Date(data.joined_at);
        console.log('[INFO] join date: ' + d);
        $('.time_container').html(d);
        console.log('[INFO]token: ' + token);
        var socket = io('/lounge?token='+ token);
        socket.on('room_create', function(msg) {
            console.log('[INFO] Created - room Id: ' + msg.room_id);
            var room_id = msg.room_id;
            $.get('/api/room/' + room_id, function(new_room_data) {
                console.log('[INFO] New room has been created: ' + JSON.stringify(new_room_data));
                $('#roomContainer').prepend(generate_room(new_room_data['data']));
            });
        });
        socket.on('room_change', function(msg) {
            console.log('[INFO] Changed - room Id: ' + msg.room_id);
            var room_id = msg.room_id;
            var num_rooms = $('#roomContainer').children().length;
            // delete original room
            for (var i = 0; i < num_rooms; ++i) {
                var this_room = $('#roomContainer .room:nth-child(' + (i + 1) + ')');
                var this_id = this_room.attr('id');
                console.log('[INFO] This room id: ' + this_id);
                if (this_id == room_id) {
                    this_room.remove();
                    break;
                }
            }

            // add a new room
            $.get('/api/room/' + room_id, function(new_room_data) {
                console.log('[INFO] New room has been created: ' + JSON.stringify(new_room_data));
                $('#roomContainer').prepend(generate_room(new_room_data['data']));
            });
        });
        socket.on('room_delete', function(msg) {
            console.log('[INFO] Deleted - room Id: ' + msg.room_id);
            var num_rooms = $('#roomContainer').children().length;
            console.log('[INFO] number of rooms: ' + num_rooms);
            $('#roomContainer').children().each(function(index) {
                // For debug
                console.log('[INFO]' + index + ": " + $( this ).attr('id'));
            });

            for (var i = 0; i < num_rooms; ++i) {
                var this_room = $('#roomContainer .room:nth-child(' + (i + 1) + ')');
                var this_id = this_room.attr('id');
                console.log('[INFO] This room id: ' + this_id);
                if (this_id == msg.room_id) {
                    this_room.remove();
                    break;
                }
            }
        });
    });

    $.get('/api/lounge', function(data) {
        console.log('[INFO]all the rooms: ' + JSON.stringify(data));
        var l = data['data'].length;
        for (var i = 0; i < l; ++i) {
//            console.log(JSON.stringify(data['data'][i]));
            var room = generate_room(data['data'][i]);
            $('#roomContainer').prepend(room);
        }
        console.log('[INFO] Initial page: we have: ' + $('#roomContainer').children().length + ' rooms.');
    })
    .fail(function() {
        alert( "error" );
    });
});

function generate_room(entry) {
    var room = $('<div/>');
    room.attr('id', entry.id);
    room.addClass('room');
    // room id
    room.append($('<div/>').addClass('room_id_container').html('<h2> Room ' + entry.id + '</h2>'));
    room.append('<hr>');

    // # of players & observers
    room.append($('<div/>').addClass('players_number_container').html('Players: ' + entry.player_count));
    room.append($('<div/>').addClass('observers_number_container').html('Observers: ' + (entry.user_count - entry.player_count)));

    // is the room playing?
    var is_playing = entry.round_id != null ? '<span class="label label-default">Playing</span>':'<span class="label label-success">Idle</span>';
    room.append(is_playing);

    // join the room button
    var join_room_form = $('<form/>');
    join_room_form.addClass('join_room_form');
    join_room_form.attr('method', 'post');
    join_room_form.append('<label class="radio-inline"><input type="radio" name="person_type" value = "player" checked>Player</label>');
    join_room_form.append('<label class="radio-inline"><input type="radio" name="person_type" value = "observer">Observer</label>');
    join_room_form.append('&nbsp; <input class = "btn btn-primary" type="submit" value="Join">');

    $(join_room_form).submit(function(event) {
        event.preventDefault();
        var v = $(this).find("input[name='person_type']:checked").val();
        console.log('[INFO] type: ' + v);
        var parameters = {room_id: $(this).parent().attr('id'), observer: v == 'observer'};
        console.log('[INFO] join_room parameters' + JSON.stringify(parameters));
        $.post( "/api/enter", parameters, function( data ) {
            if (data.code == 0) {
                console.log('[INFO]enter successfully!');
                location.href = '/room';
            } else {
                alert('[ERROR]' + data.error);
            }
        });
    });
    room.append(join_room_form);
    return room;
}