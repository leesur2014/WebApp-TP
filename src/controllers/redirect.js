exports.directLogin = function(req, res) {
    res.render('index', {title: 'Log in'});
};

exports.directGameCenter = function(req, res) {
    res.render('gameCenter');
};