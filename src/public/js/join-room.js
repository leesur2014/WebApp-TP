$('#join-room-form').submit(function(event) {
    event.preventDefault();
    var form = this;
    var data = {
      room_id: form.room_id.value,
      passcode: form.passcode.value,
      observer: form.observer.checked
    };
    $.post("/api/enter", data, function(resp) {
      if (resp.code == 0) {
        location.reload();
      } else {
        alert('Error: ' + resp.error);
      }
    });
});
