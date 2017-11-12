$(document).ready(function() {
    var nickname = $("#name").value;
    $("#form-create").click(function() {
        console.log(nickname);
        location.href=('http://127.0.0.1:3000/static/html/game-center.html');
        //$.post('/api/me', {'nickname':nickname})
        // .done(function(data) {
        //     $.get('/api/lounge');
        // }) 
        // .fail(function() {
        // alert("Error");
        // });
    })  
    
});