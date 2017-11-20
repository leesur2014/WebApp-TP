$('#create_room').submit(function(event) {
    console.log("Handler for join-room .submit() called.");
    event.preventDefault();
    var parameters = {};
    parameters['passcode'] = $('#password').val();
    console.log(JSON.stringify(parameters));
    $.post( "/api/room", parameters, function( data ) {
        if (data.code == 0) {
            console.log('[INFO] enter successfully!');
            location.href = '/room';
        } else {
            alert('[ERROR]' + data.error);
        }
    });
});
