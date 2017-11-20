$('#create_room').submit(function(event) {
    event.preventDefault();
    var data = {};
    data.passcode = $('#passcode').val();
    $.post( "/api/room", parameters, function( data ) {
        if (data.code == 0) {
            console.log('[INFO] enter successfully!');
            location.href = '/room';
        } else {
            alert('An error occurred: ' + data.error);
        }
    });
});
