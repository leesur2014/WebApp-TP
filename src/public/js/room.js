$(function() {
    var data = {
    "code": 0,
    "data": {
        "id": 1,
        "passcode": "          ",
        "created_at": "2017-11-05T23:43:53.451Z",
        "deleted_at": null,
        "users": [
            {
                "id": 1,
                "nickname": "xxxx",
                "observer": false,
                "ready": false
            },
            {
                "id": 4,
                "nickname": "whatever",
                "observer": true,
                "ready": false
            }
        ],
        "round": {
          "id": 10,
          "painter_id": 20,
          "started_at": "2017-10-05T14:48:00.000Z"
        }
    }
};
    var painter_id = data.data["round"]["painter_id"];
    var users = data.data["users"];
    var userList = $('<div />', {"class":'room-info'});
    var painter = document.createElement("div");
    painter.innerHTML = "<a class=\"room-col alignleft\">"+String(painter_id)+"</a>"+"<a class=\"room-col alignright\">Painter</a><br>";
    $('.room').append(userList);
    userList.append(painter);
    
    for(var i=0;i<users.length;i++) {
        var usr = document.createElement("div");
        var role = "   Player";
        if(users[i]["observer"] == true) {
            role = "   Observer";
        }
        usr.innerHTML = "<a class=\"room-col\">"+String(users[i]["nickname"])+"</a>"+"<a style=\"clear: both;\" class=\"room-col alignright\">"+role+"</a><br>";
        userList.append(usr);
    }
    
    /*
    console.log('[INFO 1]');
    $.get( "/api/me", function( data ) {
        console.log('data: ' + JSON.stringify(data));
        console.log('data: ' + data['nickname']);
        $('#nameContainer').html(data.nickname);
    });
    */
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