$(function () {

  var round;
  var room;
  var me;
  var userRows = [];
  var users = [];

  var canvas;
  var context;

  $.when($.getJSON('/api/me'), $.getJSON('/api/room'), $.getJSON('/api/round'))
    .done(function (_me, _room, _round) {
      if (_me[0].code != 0)
      {
        // fatal error
        alert("Error: " + _me[0].error);
        return;
      }

      if (_room[0].code != 0) {
        // fatal error
        alert("Error: " + _room[0].error);
        return;
      }

      me = _me[0].data;
      room = _room[0].data;

      if (room.passcode) {
        $("#room-passcode").text("Passcode: " + room.passcode);
      } else {
        $("#room-passcode").text("Public Room");
      }

      // load and display each user's information
      for (var i in room.users) {
        $.getJSON('/api/user/' + room.users[i].id, function (resp) {
          if (resp.code != 0) {
            alert("Error: " + resp.error);
          } else {
            var row = generate_user_row(resp.data);
            $("#users-tbody").append(row);
            userRows[resp.data.id] = row;
            users[resp.data.id] = resp.data;
          }
        });
      }

      if (_round[0].code == 0) {
        // when there is a round
        round = _round[0].data;
        init_round();
      } else {
        round = null;
        init_idle();
      }

      init_socket();

    });


  $('#logout-btn').click(function() {
    if (round != null)
    {
      var r = confirm("You are in a round. Do you still want to exit?");
      if (!r)  return;
    }

    $.post("/api/exit", {force: (round != null)}, function(resp) {
      if (resp.code != 0)
      {
        alert('Error: ' + resp.error);
      }
      location.reload();
    });
  });

  $("#ready-btn").click(function (e) {
    $("#idle-div").hide();
    $.post("/api/ready", {ready: true});
  });

  $("#guess-form").submit(function(e) {
    e.preventDefault();
    $.post("/api/guess", $(e.target).serialize(), function (resp) {
      if (resp.code != 0) {
        alert("Error: " + resp.error);
      }
      else if (resp.correct) {
        $("#guess-result").text("Correct guess!");
      } else {
        $("#guess-result").text("Wrong guess, try again. :)");
      }
    });
    e.target.reset();
  })


  function init_socket() {
    var socket = io('/room?token=' + me.token, {
      reconnectionAttempts: 5
    });

    socket.on('user_enter', function(msg) {
      $.getJSON('/api/user/' + msg.user_id, function (resp) {
        if (resp.code != 0) {
          alert("Error: " + resp.error);
        } else {
          var row = userRows[resp.data.id] = generate_user_row(resp.data);
          $("#users-tbody").append(row);
          users[resp.data.id] = resp.data;
          add_message(resp.data.nickname + " entered the room.");
        }
      });
    });

    socket.on('user_exit', function(msg) {
      if (userRows[msg.user_id]) {
        userRows[msg.user_id].remove();
        add_message(users[msg.user_id].nickname + " left the room.");
        delete userRows[msg.user_id];
      }
    });

    socket.on('user_change', function(msg) {
      if (userRows[msg.user_id]) {
        var user = users[msg.user_id];
        user.ready = msg.ready;
        var row = generate_user_row(user);
        userRows[msg.user_id].replaceWith(row);
        userRows[msg.user_id] = row;
        if (user.ready) {
          add_message(user.nickname + " is ready.");
        } else {
          add_message(user.nickname + " is not ready.");
        }
      }
    });

    socket.on('user_guess', function(msg) {
      add_message(users[msg.user_id].nickname + " made a " + (msg.correct ? "correct" : "wrong") + " guess");
    });

    socket.on('user_draw', function(msg) {
      if ((round.painter_id != me.id) && canvas && context) {
        // if I am not the painter
        var image = new Image();
        image.src = msg.image;
        image.onload = function() {
          // redraw everything
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0);
        };
      }
    });


    socket.on('round_start', function(msg) {
      $.getJSON('/api/round', function (resp) {
        if (resp.code != 0) {
          alert("Error: " + resp.error);
          return;
        }
        round = resp.data;
        if (round.painter_id == me.id) {
          add_message("Round started. You are the painter.");
        } else {
          add_message("Round started. " + users[round.painter_id].nickname + " is the painter.");
        }

        init_round();
      });
    });


    socket.on('round_end', function(msg) {
      $.getJSON('/api/round/' + round.id, function (resp) {
        if (resp.code != 0) {
          alert("Error: " + resp.error);
          location.reload();
        }

        var tbody = $("#round-result-tbody");

        $("#round-result-answer").text(resp.data.answer);

        tbody.append(generate_result_row(users[resp.data.painter_id].nickname, resp.data.painter_score));

        for (var i in resp.data.users) {
          var user_id = resp.data.users[i].user_id;
          tbody.append(generate_result_row(users[user_id].nickname, resp.data.users[i].score));
        }

        $('#round-result-modal').modal('show');
        $('#round-result-modal').on('hide.bs.modal', function () {
          location.reload();
        });
      })
    });

    socket.on('count_down', function(msg) {
      if (round) {
        $(".count-down").text(msg.seconds + " seconds left");
        $(".count-down").show();
      } else {
        // should not reach here
        $(".count-down").hide();
      }
    });


    socket.on('reconnecting', function (attempt) {
      show_alert(`Connection lost. Reconnecting #${attempt}...`);
    });

    socket.on('reconnect_failed', function (attempt) {
      show_alert("Reconnection failed. Please check your network and refresh the page.");
    });

    socket.on('reconnect', function (attempt) {
      hide_alert();
    });
  }


  function init_painter() {

    $("#word").text(round.answer);

    // prepare painter's canvas
    // ref: https://github.com/socketio/socket.io/blob/master/examples/whiteboard/public/main.js
    canvas = $("#painter-canvas")[0];
    context = canvas.getContext('2d');

    var drawing = false;

    var current = {
      color: 'black',
      width: 2,
      eraser: false
    }

    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('mouseout', onMouseUp, false);
    canvas.addEventListener('mousemove', onMouseMove, false);

    function drawLine(x0, y0, x1, y1, color, width) {
      // console.log("drawline", x0, y0, x1, y1, color, width)
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.strokeStyle = color;
      context.lineWidth = width;
      context.stroke();
      context.closePath();
    }


    function onMouseDown(e){
      drawing = true;
      var offset = $(canvas).offset();
      current.x = e.pageX - offset.left;
      current.y = e.pageY - offset.top;
    }

    function onMouseUp(e){
      if (!drawing)  return;
      drawing = false;
      var offset = $(canvas).offset();
      if (current.eraser) {
        drawLine(current.x, current.y, e.pageX - offset.left, e.pageY - offset.top, 'white', 40);
      } else {
        drawLine(current.x, current.y, e.pageX - offset.left, e.pageY - offset.top, current.color, current.width);
      }
      $.post('/api/draw', {image: canvas.toDataURL()}, function (resp) {
        console.log(resp);
      });
    }

    function onMouseMove(e){
      if (!drawing) return;
      var offset = $(canvas).offset();
      if (current.eraser) {
        drawLine(current.x, current.y, e.pageX - offset.left, e.pageY - offset.top, 'white', 40);
      } else {
        drawLine(current.x, current.y, e.pageX - offset.left, e.pageY - offset.top, current.color, current.width);
      }

      current.x = e.pageX - offset.left;
      current.y = e.pageY - offset.top;
    }

    $("#pencil-btn").click(function (e) {
      current.width = 2;
      current.eraser = false;
      $("#style-div button").removeClass("active");
      $(e.target).addClass("active");
    });

    $("#brush-btn").click(function (e) {
      current.width = 6;
      current.eraser = false;
      $("#style-div button").removeClass("active");
      $(e.target).addClass("active");
    });

    $("#eraser-btn").click(function (e) {
      current.eraser = true;
      $("#style-div button").removeClass("active");
      $(e.target).addClass("active");
    });

    $("#color-div button").click(function (e) {
      current.color = $(e.target).text();
      $("#color-div button").removeClass("active");
      $(e.target).addClass("active");
    });

    $("#clear-btn").click(function () {
      console.log("clear");
      context.clearRect(0, 0, canvas.width, canvas.height);
      $.post('/api/draw', {image: canvas.toDataURL()});
    });

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (round.image) {
      // in case the painter refreshes the page during a round
      var image = new Image();
      image.src = round.image;
      image.onload = function() {
        context.drawImage(image, 0, 0);
      };
    }

    $("#painter-div").show();
  }


  function init_guesser() {
    canvas = $("#guesser-canvas")[0];
    context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    $("#guess-result").text("");
    $("#guesser-div").show();

    if (round.image) {
      // in case the user refreshes the page during a round
      var image = new Image();
      image.src = round.image;
      image.onload = function() {
        context.drawImage(image, 0, 0);
      };
    }
  }

  function init_observer() {
    canvas = $("#guesser-canvas")[0];
    context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    $("#guess-form").hide();
    $("#guesser-div").show();

    if (round.image) {
      // in case the user refreshes the page during a round
      var image = new Image();
      image.src = round.image;
      image.onload = function() {
        context.drawImage(image, 0, 0);
      };
    }
  }

  function init_idle() {
    $(".count-down").hide();
    $("#painter-div").hide();
    $("#guesser-div").hide();
    $("#users-div").show();
    if (me.observer) {
      $("#idle-div").hide();
    } else {
      $("#idle-div").show();
    }
  }


  function init_round() {
    console.assert(round);
    $("#idle-div").hide();
    $("#users-div").hide();
    if (me.id == round.painter_id) {
      init_painter();
    } else if (!me.observer) {
      init_guesser();
    } else {
      init_observer();
    }
  }
});

function add_message(msg) {
  var el = $("<li>").text(msg);
  el.addClass("list-group-item");
  $("#messages").prepend(el);
}

function generate_user_row(user) {
  var row = $("<tr>");

  row.append($("<td>").text(user.nickname));
  row.append($("<td>").text(user.score_draw + user.score_guess));
  row.append($("<td>").text(user.observer ? "Observer" : "Player"));
  row.append($("<td>").text(user.ready ? "Yes" : "No"));

  return row;
}


function generate_result_row(nickname, score) {
  var row = $("<tr>");

  row.append($("<td>").text(nickname));
  row.append($("<td>").text(score));

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
