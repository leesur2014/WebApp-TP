$(function () {

  $.get('/api/top-users', function(res) {
    for(var i = 0; i < res.data.length; i++) {
        var row = $('<tr>');

        var nickname = $('<td>');
        nickname.text(res.data[i].nickname);
        row.append(nickname);

        var score_draw = $('<td>');
        score_draw.text(res.data[i].score_draw);
        row.append(score_draw);

        var score_guess = $('<td>');
        score_guess.text(res.data[i].score_guess);
        row.append(score_guess);

        var score_total = $('<td>');
        score_total.text(res.data[i].score);
        row.append(score_total);

        $('#rank-table').append(row);
    }
  });

});
