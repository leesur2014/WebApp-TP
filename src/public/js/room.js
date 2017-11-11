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
            alert('[ERROR]' + data.error);
        }
    });
})