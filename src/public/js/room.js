$(document).ready(function () {

  var round;
  var room;
  var me;
  var users = [];

  $.when($.getJSON('/api/me'), $.getJSON('/api/room'), $.getJSON('/api/round'))
    .done(function (_me, _room, _round) {
      me = _me[0].data;

      if (_room[0].code != 0) {
        alert("Error: " + _room[0].error);
      } else {
        room = _room[0].data;
      }

      if (room.passcode) {
        $("#room-passcode").text("Passcode: " + room.passcode);
      } else {
        $("#room-passcode").text("Public Room");
      }

      init_users();

      if (_round[0].code == 0) {
        round = _round[0].data;
        init_round();
      } else {
        round = null;
        init_idle();
      }

      init_socket();

    });


  $('#logout').click(function() {
    if (round != null)
    {
      var r = confirm("You are in a round. Do you still want to exit?");
      if (r === false)  return;
    }

    $.post("/api/exit", {force: (round != null)}, function(resp) {
      if (resp.code != 0)
      {
        alert('Error:' + data.error);
      }
      location.reload();
    });
  });


  function init_socket() {
    var socket = io('/room?token=' + me.token);

    socket.on('user_enter', function(msg) {

    });

    socket.on('user_exit', function(msg) {

    });


    socket.on('user_change', function(msg) {

    });


    socket.on('user_guess', function(msg) {

    });


    socket.on('user_draw', function(msg) {
      if (round.painter_id != me.id) {

      }
    });


    socket.on('round_start', function(msg) {

    });


    socket.on('round_end', function(msg) {

    });

    socket.on('count_down', function(msg) {

    });
  }


  function init_painter() {

    $("#word").text(round.answer);

    // prepare painter's canvas
    var canvas = $("#painter-canvas")[0];
    var context = canvas.getContext('2d');
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
      current.x = e.clientX - offset.left;
      current.y = e.clientY - offset.top;
    }

    function onMouseUp(e){
      if (!drawing)  return;
      drawing = false;
      var offset = $(canvas).offset();
      if (current.eraser) {
        drawLine(current.x, current.y, e.clientX - offset.left, e.clientY - offset.top, 'white', 40);
      } else {
        drawLine(current.x, current.y, e.clientX - offset.left, e.clientY - offset.top, current.color, current.width);
      }
      $.post('/api/draw', {image: canvas.toDataURL()}, function (resp) {
        console.log(resp);
      });
    }

    function onMouseMove(e){
      if (!drawing) return;
      var offset = $(canvas).offset();
      if (current.eraser) {
        drawLine(current.x, current.y, e.clientX - offset.left, e.clientY - offset.top, 'white', 40);
      } else {
        drawLine(current.x, current.y, e.clientX - offset.left, e.clientY - offset.top, current.color, current.width);
      }

      current.x = e.clientX - offset.left;
      current.y = e.clientY - offset.top;
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

    if (round.image) {
      // in case the painter refreshes the page during a round
      var image = new Image();
      drawing.src = round.image;
      drawing.onload = function() {
         context.drawImage(image, 0, 0);
      };
    }
  }


  function init_guesser() {

  }

  function init_idle() {
    console.log(room);
  }


  function init_round() {

  }


  function init_users() {
    for (var i in room.users) {
      $.getJSON('/api/user/' + room.users[i].id, function (resp) {
        if (resp.code != 0) {
          alert("Error: " + resp.error);
        } else {
          var row = users[room.users[i].id] = generate_user_row(resp.data);
          $("#users-tbody").append(row);
        }
      });
    }
  }
});



function generate_user_row(user, role) {
  var row = $("<tr>");

  row.append($("<td>").text(user.nickname));
  row.append($("<td>").text(user.score_draw + user.score_guess));
  row.append($("<td>").text(role || (user.observer ? "Observer" : "Player")));
  row.append($("<td>").text(user.ready ? "Yes" : "No"));

  return row;
}
