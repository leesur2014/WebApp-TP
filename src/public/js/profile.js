
$(function () {

  $('#change-nickname-form').submit(function(event) {
      event.preventDefault();
      var data = {
        nickname: this.nickname.value
      };
      $.post("/api/me", data, function(resp) {
          if (resp.code == 0) {
              location.reload();
          } else {
              alert('Error: ' + resp.error);
          }
      });
  });

  $("#profile-modal").on("show.bs.modal", function () {
    $.getJSON("/api/rank", function (resp) {
      if (resp.code != 0) {
        alert("Error: " + resp.error);
      } else {
        $("#user-ranking").text(`${resp.data.rank} / ${resp.data.total}`);
      }
    })
  });
  
});
