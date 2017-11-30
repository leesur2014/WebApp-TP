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


$(document).ready(function() {
  $('input[type=radio][name=room-type]').change(function() {
    if (this.value == 'private') {
      $("#room-password-div").show();
    } else {
      $("#room-password-div").hide();
      $("#room-password-input").val("");
    }
  });
});
