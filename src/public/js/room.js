var token;
var my_id;
var canvas, ctx;
var mouse = {
  click: false,
  move: false,
  pos: {x:0, y:0},
  pos_prev: false
};
$(function() {
    canvas = $('#drawing');
    ctx = document.getElementById('drawing').getContext('2d');
    // Get an initial list of players & observers
    $.get('/api/room', function(data) {

        if (data.code == 0) {
            // detect if a game is going on
            if (data.data.round_id != null) {
                console.log('[INFO] This room is in game.\n');
                console.log('[INFO] Round ID: ' + data.data.round_id);
                is_gaming(data.data.round_id);
            }
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
                for (var i in list_players) {
                    var this_player_entry = $('<li/>').html(list_players[i].nickname).attr('id', list_players[i].id).addClass("list-group-item list-group-item-action list-group-item-success");
                    dom_players.append(this_player_entry);
                }

                $('#side_bar .players_container').append(dom_players);
             }

              if (list_observers.length > 0) {

                 var dom_obs= $('<ul/>').addClass('list-group');
                 for (var i in list_observers) {
                    var this_observer_entry = $('<li/>').html(list_observers[i].nickname).attr('id', list_observers[i].id).addClass("list-group-item list-group-item-action");
                     dom_obs.append(this_observer_entry);
                 }
                 $('#side_bar .observers_container').append(dom_obs);
              }
        } else {
            alert('[ERROR] Cannot get this room information');
        }
    });

    $.get( "/api/me", function( data ) {
        console.log('[INFO] "/api/me" responses: ' + JSON.stringify(data));
        console.log('[INFO]nickname: ' + data['nickname']);
        // set my ID
        my_id = data['id'];

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

        // get those initial strokes
        $.get('/api/round', function(res_round) {
            if(res_round.code == 0) {
                var img = new Image;
                console.log('[INFO] Initial canvas image: ' + res_round.data.image);

                var img = new Image;
                img.onload = function() {
                    ctx.drawImage(img, 0, 0);
                }
                img.src = res_round.data.image;
            }
        });

        // initialize the ready_bar to indicate whether I am ready
        console.log('Is observer? ' + (data.observer == false));
        console.log('Is ready? ' + (data.ready == false));
        if (data.observer == false) {
            if (data.ready == false) {
                unready();
            } else {
                ready();
            }
        } else {
            $('#guess_form').remove();
        }


        token = data.token;

        console.log('[INFO]token: ' + token);
        var socket = io('/room?token='+ token);
        // Listen events: If a user enter or exit this room, update the page in real-time
        socket.on('user_enter', function(msg) {

            console.log('[INFO] User enter: ' + JSON.stringify(msg));
            $.get('/api/user/' + msg.user_id, function(data) {
                if (data.code == 0) {
                    if (data.data.observer == false) {
                        $('#side_bar .players_container ul').append($('<li/>').html(data.data.nickname).attr('id', data.data.id).addClass("list-group-item list-group-item-action list-group-item-success"));
                    } else {
                        $('#side_bar .observers_container ul').append($('<li/>').html(data.data.nickname).attr('id', data.data.id).addClass("list-group-item list-group-item-action"));
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

        // listen on 'round_start' event
        socket.on('round_start', function(msg) {
            console.log('[INFO] Game start: ' + JSON.stringify(msg));
            is_gaming(msg.round_id);
        });

        socket.on('user_draw', function(msg) {
            console.log('[INFO] New stroke: ' + JSON.stringify(msg));
            var img = new Image;
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
            }
            img.src = msg.image;
        });
    });
});

function is_gaming(round_id) {
    // remove the 'ready bar' - as it won't be used in this round any more
    $('#ready_bar').remove();
    // maintain invariants - display the game states while this round is ongoing
    $('#game_ongoing_bar').empty();
    $.get('/api/round', function(data) {
        if (data.code == 0) {
            // get the name of user (for visualization)
            $.get('/api/user/' + data.data.painter_id, function(user_info) {
                if (user_info.code == 0) {
                    var painter_display;
                    if (data.data.painter_id == my_id) {
                        // 'I' am the painter, am able to paint on Canvas
                        painter_display = $('<h3/>').html('You are the painter! - The answer of this round: <em>' + data.data.answer + '</em>');
                    } else {
                        // I could only see the canvas
                        painter_display = $('<h3/>').html('Gaming! - The painter of this round: ' + user_info.data.nickname);
                    }
                    $('#game_ongoing_bar').append(painter_display);

                    $('#drawing').mousemove(function(event) {
                        mouse.pos.x = event.pageX - canvas.offset().left;
                        mouse.pos.y = event.pageY - canvas.offset().top;
                        mouse.move = true;
                    });
                    $('#drawing').mousedown(function() {
                        mouse.click = true;
                    });
                    $('#drawing').mouseup(function() {
                        mouse.click = false;
                        var dataURL = document.getElementById('drawing').toDataURL();
                        console.log('[INFO] dataURL: ' + dataURL);
                        $.post('/api/draw', {image: dataURL}, function(draw_res) {
                            console.log('[INFO] Response: ' + JSON.stringify(draw_res));
                        })

                    });
                    mainLoop();

                } else {
                    alert('[ERROR] Cannot get the painter information');
                }
            });

        } else {
            alert('[ERROR] Cannot get the round information');
        }
    });
}

function mainLoop(event) {
//
//    var x = event.clientX;
//    var y = event.clientY;
//    var coords = "X coords: " + x + ", Y coords: " + y;
//    console.log('[INFO] Absolute position: ' + event.clientX + ', ' + event.clientY);
//    console.log('[INFO] canvas position: ' + canvas.offset().left + ', ' + canvas.offset().top);
//    var mouseX = event.pageX - canvas.offset().left;
//    var mouseY = event.pageY - canvas.offset().top;
//    ctx.fillStyle = "orange";
//    ctx.fillRect(mouseX, mouseY, 30, 30);
//    console.log('[INFO] The position of mouse: ' + mouseX + ', ' + mouseY);
    // check if the user is drawing
    if (mouse.click && mouse.move && mouse.pos_prev) {
        ctx.beginPath();
        ctx.moveTo(mouse.pos_prev.x, mouse.pos_prev.y);
        ctx.lineTo(mouse.pos.x, mouse.pos.y);
        ctx.stroke();
//        console.log('[INFO] Mouse info: ' + JSON.stringify(mouse));
        mouse.move = false;
    }
    mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
    setTimeout(mainLoop, 25);
}

// set the button to 'ready' state
function ready() {
    $('#ready_bar').empty();
    var unready_btn = $('<button/>').attr('type', 'button').addClass('btn btn-success').html('You are ready! Click here to cancel');
    $(unready_btn).click(function() {
        $.post('/api/ready', {ready: false}, function(data) {
            if (data.code == 0) {
                unready();
            } else {
                alert('[ERROR] Cannot unready!');
            }
        });
    });
    $('#ready_bar').append(unready_btn);
}

// set the button to 'unready' state
function unready() {
    $('#ready_bar').empty();
    var ready_btn = $('<button/>').attr('type', 'button').addClass('btn btn-default').html('Your are not ready! Click here to get ready for a game');
    $(ready_btn).click(function() {
        $.post('/api/ready', {ready: true}, function(data) {
            if (data.code == 0) {
                ready();
            } else {
                alert('[ERROR] Cannot get ready!');
            }
        });
    });
    $('#ready_bar').append(ready_btn);
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