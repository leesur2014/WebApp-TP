var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var should = chai.should();
var server = require('../app');

describe('Draw_and_Guess', function() {
    it('should allow user login /users/login GET');
    //GET | `/api/me` | Get current user's info
    it('should get user info /api/me GET');
    //POST | `/api/me` | change my nickname
    it('should chagne nickname /api/me POST');
    //GET | `/api/lounge` | Get a list of public rooms
    it('should list all rooms /api/lounge GET');
    //GET | `/api/room` | Get detailed info about current room
    it('should list user\'s current room /api/room GET');
    //GET | `/api/user/{user_id}` | Get info about a user
    it('should get the user info /api/user/{user_id} GET');
    //POST | `/api/room` | Create a room
    //POST | `/api/enter` | Join a room
    //POST | `/api/exit` | Quit a room
    //POST | `/api/ready` | Set/clear the user's ready bit
    //POST | `/api/submit` | Submit the answer for a round
    //POST | `/api/draw` | Send the painter's drawing
});

it('should allow user login /users/login GET', function(done) {
  chai.request(server)
    .get('/users/login')
    .end(function(err, res){
        //console.log(res);
      res.should.have.status(200);
      done();
    });
});

it('should get user info /api/me GET', function(done) {
    chai.request(server)
        .get('/api/me')
        .end(function(err,res) {
            res.should.have.status(200);
            res.should.be.jason;
            res.body.should.have.property('nickname');
            res.body.should.have.property('online');
            res.body.online.should.equal('true');
            done();

        });
});

it('should list all rooms /api/lounge GET', function(done) {
    chai.request(server)
        .get('/api/lounge')
        .end(function(err, res) {
            res.should.have.status(200);
            res.should.be.jason;
            res.body.should.be.a('array');
            done();
        });
});

it('should chagne nickname /api/me POST', function(done) {
    chai.request(server)
        .post('/api/me')
        .send({'nickname':'Mary'})
        .end(function(err, res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('nickname');
            res.body.nickname.should.equal('Mary');
            done();
        });
});

it('should list user\'s current room /api/room GET', function(done) {
    chai.request(server)
        .get('/api/room')
        .end(function(err,res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('data');
            res.body.data.should.have.property('id');
            res.body.data.should.have.property('users');
            done();
        });
});

it('should get the user info /api/user/{user_id} GET', function(done) {
    chai.request(server)
        .get('/api/user/2')
        .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.have.property('data');
            res.body.data.should.have.property('id');
            res.body.data.id.should.equal('2');
            done();
        });
});
