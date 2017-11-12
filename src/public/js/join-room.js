$('#join_room').submit(function(event) {
    console.log("Handler for join-room .submit() called.");
    event.preventDefault();
    var parameters = {room_id: $('#room_id').val(), passcode: $('#password').val(), observer: $('#observer').is(":checked")};
    console.log(JSON.stringify(parameters));
    $.post( "/api/enter", parameters, function( data ) {
        if (data.code == 0) {
            console.log('[INFO]enter successfully!');
            location.href = '/room';
        } else {
            alert('[ERROR]' + data.error);
        }
    });
});
