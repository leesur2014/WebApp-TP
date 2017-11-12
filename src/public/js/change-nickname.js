$('#change_nickname').submit(function(event) {
    console.log("Handler for change-nickname .submit() called.");
    event.preventDefault();
    if ($('#nickname').val()) {
        var parameters = {'nickname': $('#nickname').val()};
        $.post( "/api/me", parameters, function( data ) {
            if (data.code == 0) {
                console.log('[INFO] nickname changed successfully!');
                location.href = '/game-center';
            } else {
                alert('[ERROR]' + data.error);
            }
        });
    }
});
