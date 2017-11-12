$(function() {
    console.log('[INFO 1]');
    $.get( "/api/me", function( data ) {
        console.log('data: ' + JSON.stringify(data));
        console.log('data: ' + data['nickname']);
        $('#nameContainer').html(data.nickname);
    });
});

$('#logOutButton').click(function() {
    $.post( "/api/exit", function( data ) {
        console.log('data: ' + JSON.stringify(data));
        if (data.code == 0) {
            location.href = '/game-center';
        } else {
            console.log('[ERROR]' + data.error);
            var r = confirm("It seems that you can't exit the room normally for now. Do you still want to exit?");
            if (r == true) {
                $.post("/api/exit", {force: "No"}, function(data) {
                    console.log('data: ' + JSON.stringify(data));
                    if (data.code == 0) {
                        location.href = '/game-center';
                        alert('[ERROR]' + data.error);
                    }
                });
            } else {
                // return to the room, no state change
            }
        }
    });
})