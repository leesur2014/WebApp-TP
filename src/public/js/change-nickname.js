$('#change-nickname-form').submit(function(event) {
    event.preventDefault();
    var data = {
      nickname: this.nickname.value
    };
    console.log(data);
    $.post("/api/me", data, function(resp) {
        if (resp.code == 0) {
            location.reload();
        } else {
            alert('An error occurred:', resp.error);
        }
    });
});
