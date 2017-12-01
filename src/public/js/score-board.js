$(function () {

  $.getJSON('/api/score-board', function(res) {

    if (res.code != 0) {
      alert("Error: " + res.error);
      return;
    }

    for(var i = 0; i < res.data.length; i++) {
        var row = $('<tr>');
        row.append($('<td>').text(res.data[i].rank));
        row.append($('<td>').text(res.data[i].nickname));
        row.append($('<td>').text(res.data[i].score_draw));
        row.append($('<td>').text(res.data[i].score_guess));
        row.append($('<td>').text(res.data[i].score));
        $('#rank-table').append(row);
    }
  });

});
