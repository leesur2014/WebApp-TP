$(document).ready(function () {

  // TODO: load score board from server
  $.get('/api/top-users', function(res) {   
    for(var i=0; i<res.data.length;i++) {
        var row = $('<tr/>');

        var node1 = $('<th/>');
        node1.html(res.data[i].nickname);
        row.append(node1);

        var node2 = $('<th/>');
        node2.html(res.data[i].score_draw);
        row.append(node2);

        var node3 = $('<th/>');
        node3.html(res.data[i].score_guess);
        row.append(node3);

        var node4 = $('<th/>');
        node4.html(res.data[i].score);
        row.append(node4);
        
        $('#rank-table').append(row);
    }   
  });
  

});
