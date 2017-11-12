var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var should = chai.should();
var server = require('../app');

describe('Draw_and_Guess', function() {
    it('home page should be rendered');
    it('should list all rooms /api/lounge GET');
});

it('home page should be rendered', function(done) {
  chai.request(server)//('http://localhost:3000')
    .get('/')
    .end(function(err, res){
        console.log(res);
      res.should.have.status(200);
      done();
    });
});

it('should list all rooms /api/lounge GET', function(done) {
    chai.request(server)//('http://localhost:3000')
        .get('/api/lounge')
        .end(function(err, res) {
            res.should.have.status(200);
            res.should.be.jason;
            res.body.should.be.a('array');
            done();
        });
});