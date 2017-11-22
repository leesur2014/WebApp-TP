var token;
var my_id;
var canvas, ctx;
var mouse = {
  click: false,
  move: false,
  pos: {x:0, y:0},
  pos_prev: false
};

// map user id to jquery elements
var people = [];
var players_container;
var observers_container;

// colorWell
var colorWell;

function updateColor(event) {
    console.log('[INFO] Changed color: ' + event.target.value);
    ctx.fillStyle = event.target.value;
    ctx.strokeStyle = event.target.value;
}

$(function() {
    canvas = $('#drawing');
    ctx = document.getElementById('drawing').getContext('2d');

    players_container = $('#side_bar #players_container ul');
    observers_container = $('#side_bar #observers_container ul');

    colorWell = document.querySelector('#colorWell');
    colorWell.addEventListener("change", updateColor, false);

    $.get('/api/room', function(data) {

        if (data.code == 0) {
            // detect if a game is going on
            if (data.data.round_id != null) {
                console.log('[INFO] This room is in game.\n');
                console.log('[INFO] Round ID: ' + data.data.round_id);
                is_gaming(data.data.round_id);
            }
             console.log('[INFO] Room info: ' + JSON.stringify(data));

             var users = data.data.users;
             /* list all players and observers in this room */
             for (var i = 0; i < users.length; ++i) {
                var this_element = generate_gamer(users[i]);
                people[users[i].id] = this_element;
                console.log('[INFO] Gamer info: ' + JSON.stringify(this_element));
                if (users[i].observer) {
                    observers_container.append(this_element);
                } else {
                    players_container.append(this_element);
                }
             }
        } else {
            alert('[ERROR] Cannot get this room information');
        }
    });

    // get those initial strokes
    $.get('/api/round', function(res_round) {
        if(res_round.code == 0) {
            var img = new Image;
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
            }
            img.src = res_round.data.image;
        }
    });

    $.get( "/api/me", function( data ) {
        console.log('[INFO] "/api/me" responses: ' + JSON.stringify(data));
        console.log('[INFO]nickname: ' + data['nickname']);
        // set my ID
        my_id = data['id'];

        $('.name_container').html(data.nickname);

        // display: if the user is in a room (sidebar)
        if (data.room_id) {
            console.log('[INFO] This user is in room' + data.room_id);
            var room_display = 'This is room ' + data.room_id;
            $('.room_id_container').html(room_display);
        } else {
            alert("Your are not in any room!\n Now you will be redirected to game center");
            location.href = '/';
        }

        // initialize the ready_bar to indicate whether I am ready
        console.log('Is observer? ' + (data.observer == false));
        console.log('Is ready? ' + (data.ready == false));
        if (!data.observer) {
            if (!data.ready) {
                unready();
            } else {
                ready();
            }
        } else {
            // an observer doesn't need an guess input
            $('#guess_form').remove();
        }


        token = data.token;
        var socket = io('/room?token='+ token);

        // Listen events: If a user enter or exit this room, update the page in real-time
        socket.on('user_enter', function(msg) {
            console.log('[INFO] User enter: ' + JSON.stringify(msg));
            $.get('/api/user/' + msg.user_id, function(data) {
                if (data.code == 0) {
                    console.log('[INFO] User enter data: ' + JSON.stringify(data.data));
                    var this_element = generate_gamer(data.data);
                    console.log('[INFO] User enter + element: ' + JSON.stringify(this_element));
                    people[data.data.id] = this_element;
                    if (!data.data.observer) {
                        players_container.append(this_element);
                    } else {
                        observers_container.append(this_element);
                    }
                } else {
                    alert('[ERROR] Cannot get the user info');
                }
            });

        });

        socket.on('user_exit', function(msg) {
            console.log('[INFO] User exit: ' + JSON.stringify(msg));
            var user_id = msg.user_id;
            if (people[user_id]) {
                people[user_id].remove();
                delete people[user_id];
            }
        });

        socket.on('user_change', function(msg) {
            console.log('[INFO] User change: ' + JSON.stringify(msg));
            var new_element = generate_gamer(msg);
            for (var idx in people) {
                console.log('[INFO] index: ' + idx);
            }
            people[msg.user_id].replaceWith(new_element);
            people[msg.user_id] = new_element;
        });

        // listen on 'round_start' event
        socket.on('round_start', function(msg) {
            console.log('[INFO] Game start: ' + JSON.stringify(msg));
            is_gaming(msg.round_id);
        });

        socket.on('user_draw', function(msg) {
//            console.log('[INFO] New stroke: ' + JSON.stringify(msg));
            var img = new Image;
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
            }
            img.src = msg.image;
        });

        socket.on('user_guess', function(msg) {
            console.log('[INFO] New guess: ' + JSON.stringify(msg));
            $.get('/api/user/' + msg.user_id, function(user_data) {
                $('#msg_container ul').prepend($('<li/>').addClass('list-group-item list-group-item-info').html('Player [' + user_data.data.nickname + '] guess - ' + msg.correct));
            });
        });

        socket.on('count_down', function(msg) {
            $('#count_down_container').empty();
            $('#count_down_container').append($('<h2/>').html('Count down: ' + msg.seconds + ' s.'))
        });

        socket.on('round_end', function(msg) {
            console.log('[INFO] Round end: ' + JSON.stringify(msg.round_id));
            $('#game_container').empty();
            $.get('/api/round/' + msg.round_id, function(round_info) {
                var res_table = $('<table/>').addClass("table table-condensed");
                res_table.append('<thead><tr><th>ID</th><th>Score </th></tr></thead>');
                var tbody = $('<tbody/>');
                for (var i = 0; i < round_info.data.users.length; ++i) {
                    var this_user = round_info.data.users[i];
                    tbody.append($('<tr/>').append($('<td/>').html(this_user.user_id)).append($('<td/>').html(this_user.score)));
                }
                res_table.append(tbody);
                $('#game_container').append($('<h1/>').html("Game Over! This round's result: "));
                $('#game_container').append(res_table);
                setTimeout(function(){location.href = '/';}, 10000);
            });
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

                        // show color selector for painter
                        $('#color_selector').show();
                        // The painter doesn't need a guess form
                        $('#guess_form').remove();
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
//                        console.log('[INFO] dataURL: ' + dataURL);
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

$('#guess_form').submit(function(event) {
    event.preventDefault();
    // send a guessing request
    $.post('/api/guess', {submission: $('#guess_input').val()}, function(data) {
        if (data.code == 0) {

        } else {
            alert('[ERROR] You cannot guess answer now!');
        }
    });
});

function generate_gamer(gamer_info) {
    var res = $('<li/>').append($('<span/>').html(gamer_info.nickname + '&nbsp;&nbsp;&nbsp;&nbsp;').addClass('nickname_container')).attr('id', gamer_info.id);
    // display different layouts for observer OR player
    if (gamer_info.observer) {
        res.addClass("list-group-item list-group-item-action");
    } else {
        if (gamer_info.ready) {
            res.append('<span class="badge">Ready</span>');
        }

        res.addClass("list-group-item list-group-item-action list-group-item-success");
    }

    return res;
}

function mainLoop(event) {
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


$('#logout').click(function() {
    $.post("/api/exit", {force: false}, function(resp) {
        if (resp.code == 0) {
            location.reload();
        } else {
            var r = confirm("You are in a round. Do you still want to exit?");
            if (r) {
                $.post("/api/exit", {force: true}, function(data) {
                    if (data.code == 0) {
                        location.reload();
                    } else {
                      alert('Error:' + data.error);
                    }
                });
            }
        }
    });
});
