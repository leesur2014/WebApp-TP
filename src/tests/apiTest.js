var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var should = chai.should();
var server = require('../app');
it('home page should be rendered', function(done) {
  chai.request(server)
    .get('/')
    .end(function(err, res){
        console.log(res);
      res.should.have.status(200);
      done();
    });
});