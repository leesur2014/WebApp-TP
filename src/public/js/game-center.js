$(function() {
    $.get('/api/lounge', function(data) {
        console.log(JSON.stringify(data));
        var l = data['data'].length;
        for (var i = 0; i < l; ++i) {
            console.log(JSON.stringify(data['data'][i]));
            var room = $('<div/>');
            room.append(document.createTextNode(data['data'][i].user_count));
            room.click(function() {
                window.location.href = "/join-room";
            });
            $('#roomContainer').append(room);
        }
    })
    .fail(function() {
        alert( "error" );
    });
});