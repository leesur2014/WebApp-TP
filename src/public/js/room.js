var room = null;
var players = [];
var observers = [];
var round = null;

$(document).ready(function () {

  $.getJSON('/api/room', function (resp) {
    if (resp.code != 0) {
      alert("Error: " + resp.error);
    }
    room = resp.data;
    if (resp.data.passcode) {
      $("#room-passcode").text("Passcode: " + resp.data.passcode);
    } else {
      $("#room-passcode").text("Public Room");
    }

    initialize();
    socketio();
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
});

function initialize()
{

}


function socketio()
{
  var socket = io('/room?token=' + $('#input-token').val());

  socket.on('user_enter', function(msg) {

  });

  socket.on('user_exit', function(msg) {

  });


  socket.on('user_change', function(msg) {

  });


  socket.on('user_guess', function(msg) {

  });


  socket.on('user_draw', function(msg) {

  });


  socket.on('round_start', function(msg) {

  });


  socket.on('round_end', function(msg) {

  });

  socket.on('count_down', function(msg) {

  });
}
