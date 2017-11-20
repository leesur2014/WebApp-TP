$('#join_room').submit(function(event) {
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
