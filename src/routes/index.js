//var express = require('express');
//var router = express.Router();
//
///* GET home page. */
//router.get('/', function(req, res) {
//  res.render('index', { title: 'Express' });
//});
//
//module.exports = router;

const routes = (app) => {
    app.route('/')
    .get((req, res) =>
        res.send('GET request successful'))
    .post((req, res) =>
            res.send('POST request successful'))
};

export default routes;