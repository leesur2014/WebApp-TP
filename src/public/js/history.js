$(function () {

  $.get('/api/history', function(res) {
    if (res.code != 0) {
      alert("Error: " + res.error);
      return;
    }
    for(var i = 0; i < res.data.length; i++) {
        var row = $('<tr>');
        var datetime = new Date(res.data[i].started_at);

        row.append($('<td>').text(datetime.toLocaleDateString()));
        row.append($('<td>').text(datetime.toLocaleTimeString()));
        row.append($('<td>').text(res.data[i].painter ? "Painter" : "Guesser"));
        row.append($('<td>').text(res.data[i].score));

        console.log(res.data[i]);
        $('#history-table').append(row);
    }
  });

});
