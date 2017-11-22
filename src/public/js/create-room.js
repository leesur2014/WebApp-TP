$('#create-room-form').submit(function(event) {
    event.preventDefault();
    var data = {
      passcode: this.passcode.value
    };
    $.post("/api/room", data, function(resp) {
        if (resp.code == 0) {
            //room created
            location.reload();
        } else {
          alert('Error: ' + resp.error);
        }
    });
});
