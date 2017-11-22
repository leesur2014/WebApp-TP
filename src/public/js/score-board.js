$(function () {
    $.get('/api/top-users', function(data) {
        console.log('[INFO] Top user data: ' + JSON.stringify(data));
        for (var i in data.data) {
            console.log('[INFO] This user: ' + JSON.stringify(data.data[i]));
            var this_entry = $('<tr/>');
        }
    });
});
