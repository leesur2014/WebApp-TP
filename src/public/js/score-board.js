$(function () {
    $.get('/api/top-users', function(data) {
        console.log('[INFO] Top user data: ' + JSON.stringify(data));
        for (var i in data.data) {
            var this_score = data.data[i];
            console.log('[INFO] This user: ' + JSON.stringify(this_score));
            var this_entry = $('<tr/>');
//            this_entry
        }
    });
});
