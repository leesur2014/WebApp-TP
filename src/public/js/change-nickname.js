$('#change_nickname').submit(function(event) {
    event.preventDefault();
    if ($('#nickname').val()) {
        var parameters = {'nickname': $('#nickname').val()};
        $.post( "/api/me", parameters, function( data ) {
            if (data.code == 0) {
                alert("Success");
            } else {
                alert('An error occurred: ' + data.error);
            }
        });
    } else {
      alert("Nickname should not be empty");
    }
});
