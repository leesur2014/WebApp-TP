$('#join-room-form').submit(function(event) {
    event.preventDefault();
    var form = this;
    var data = {
      room_id: form.room_id.value,
      passcode: form.passcode.value,
      observer: form.observer.checked
    };
    // console.log(data);
    $.post("/api/enter", data, function(resp) {
      if (resp.code == 0) {
        console.log("redirect user to room page");
        location.href = '/room';
      } else {
        alert('An error occurred:', resp.error);
      }
    });
});
