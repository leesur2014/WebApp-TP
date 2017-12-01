var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var should = chai.should();
var app = require('../app');
var expect = chai.expect;
var server = require('../app').server;   
var assert = chai.assert;      
//var Url = 'http://localhost:3000';
var Url = 'http://guessmydrawing.fun';

var cookie_sid = 's%3AWdSqYSRyTzSvAe_WTcYO4oioR3NIWWtJ.7zqyz5xzj0uVHulUd%2F6BHmMslGJ3JWfG3il4yZzpXMw';
var cookie_io = 'FDj-r_Ld4Gvi7jdAAABQ';
var cookie_csrf = 'AwrHXaiD0A8gtU0S9aEGgrtjQcbUC22aXpUiyCldjZerPFa01xouJ44wj66oKcii';

const request = require('supertest');
describe('API Test', function() {

  before(function (done) {
    server.close();
    done();
  });

    after(function (done) {
      server.close(function() {
        server.shutdown;
      });
      done();
    });

var curr_user_id;
it('should get user info /api/me GET', function(done) {
   request(Url)
           .get('/api/me')
           .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*\/*;q=0.8')
           .set('Content-Type', 'application/json')
           .set('Accept-Encoding','gzip, deflate')
           .set('Accept-Language','zh-CN,zh;q=0.8')
           .set('Cookie',['connect.sid='+cookie_sid,'io='+cookie_io,'csrftoken='+cookie_csrf])
           .send({ fb_id: '123456', displayName: 'Mary White' })

        .end(function(err,res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('code');
            res.body.should.have.property('data');
            res.body.data.should.have.property('nickname');
            res.body.data.should.have.property('score_draw');
            res.body.data.should.have.property('score_guess');
            res.body.data.should.have.property('joined_at');
            res.body.data.should.have.property('last_seen');
            res.body.data.should.have.property('room_id');
            res.body.data.should.have.property('ready');
            res.body.data.should.have.property('observer');
            res.body.data.should.have.property('round_id');
            res.body.data.should.have.property('score');
            res.body.data.should.have.property('painter');
            curr_user_id = res.body.data.id;
            done();
        });
});

it('should list all rooms /api/lounge GET', function(done) {
   request(Url)
           .get('/api/lounge')
           .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*\/*;q=0.8')
           .set('Content-Type', 'application/json')
           .set('Accept-Encoding','gzip, deflate')
           .set('Accept-Language','zh-CN,zh;q=0.8')
           .set('Cookie',['connect.sid='+cookie_sid,'io='+cookie_io,'csrftoken='+cookie_csrf])
           .send({ fb_id: '123456', displayName: 'Mary White' })
        .end(function(err, res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.have.property('code');
            res.body.code.should.equal(0);
            res.body.should.have.property('data');
            res.body.data.should.be.a('array');
            done();
        });
});

it('should chagne nickname /api/me POST', function(done) {
   request(Url)
           .post('/api/me')
           .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*\/*;q=0.8')
           .set('Content-Type', 'application/json')
           .set('Accept-Encoding','gzip, deflate')
           .set('Accept-Language','zh-CN,zh;q=0.8')
           .set('Cookie',['connect.sid='+cookie_sid,'io='+cookie_io,'csrftoken='+cookie_csrf])
           .type('form')
           .send({nickname:'Mary'})
        .end(function(err, res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.have.property('code');
            res.body.code.should.equal(0);
            res.body.should.have.property('data');
            res.body.data.should.have.property('nickname');
            res.body.data.nickname.should.equal('Mary');
            done();
        });
});

it('should back to game center / GET', function(done) {
   request(Url)
  .get('/')
  .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*\/*;q=0.8')
  .set('Content-Type', 'application/json')
  .set('Accept-Encoding','gzip, deflate')
  .set('Accept-Language','zh-CN,zh;q=0.8')
  .set('Cookie',['connect.sid='+cookie_sid,'io='+cookie_io,'csrftoken='+cookie_csrf]) 
  .end(function(err, res) {
    res.should.have.status(200);
    done();
  });
});


it('should create room /api/room POST', function(done) {
   request(Url)
  .post('/api/room')
  .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*\/*;q=0.8')
  .set('Content-Type', 'application/json')
  .set('Accept-Encoding','gzip, deflate')
  .set('Accept-Language','zh-CN,zh;q=0.8')
  .set('Cookie',['connect.sid='+cookie_sid,'io='+cookie_io,'csrftoken='+cookie_csrf]) 
  .end(function(err, res) {
    res.should.have.status(200);
    res.body.should.have.property('code');
    res.body.code.should.equal(0);
    res.body.should.have.property('data');
    done();
  });
});


var curr_room_id;
it('should list user\'s current room /api/room GET', function(done) {
   request(Url)
    .get('/api/room')
    .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*\/*;q=0.8')
    .set('Content-Type', 'application/json')
    .set('Accept-Encoding','gzip, deflate')
    .set('Accept-Language','zh-CN,zh;q=0.8')
    .set('Cookie',['connect.sid='+cookie_sid,'io='+cookie_io,'csrftoken='+cookie_csrf]) 
        .end(function(err,res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('data');
            res.body.data.should.have.property('id');
            curr_room_id = res.body.data.id;
            res.body.data.should.have.property('users');
            done();
        });
});

it('should list users history records /api/history GET', function(done) {
  request(Url)
    .get('/api/history')
    .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*\/*;q=0.8')
    .set('Content-Type', 'application/json')
    .set('Accept-Encoding','gzip, deflate')
    .set('Accept-Language','zh-CN,zh;q=0.8')
    .set('Cookie',['connect.sid='+cookie_sid,'io='+cookie_io,'csrftoken='+cookie_csrf]) 
        .end(function(err,res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('data');
            res.body.data.should.be.a('array');
            res.body.data[0].should.have.property('user_id');
            res.body.data[0].should.have.property('round_id');
            res.body.data[0].should.have.property('started_at');
            res.body.data[0].should.have.property('ended_at');
            res.body.data[0].should.have.property('score');
            res.body.data[0].should.have.property('painter');
            done();
        });
});

it('should get users rank info /api/rank GET', function(done) {
  request(Url)
    .get('/api/rank')
    .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*\/*;q=0.8')
    .set('Content-Type', 'application/json')
    .set('Accept-Encoding','gzip, deflate')
    .set('Accept-Language','zh-CN,zh;q=0.8')
    .set('Cookie',['connect.sid='+cookie_sid,'io='+cookie_io,'csrftoken='+cookie_csrf]) 
        .end(function(err,res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('data');
            res.body.data.should.have.property('rank');
            res.body.data.should.have.property('total');
            done();
        });
});

it('should get user ready /api/ready POST', function(done) {
   request(Url)
  .post('/api/ready')
  .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*\/*;q=0.8')
  .set('Content-Type', 'application/json')
  .set('Accept-Encoding','gzip, deflate')
  .set('Accept-Language','zh-CN,zh;q=0.8')
  .set('Cookie',['connect.sid='+cookie_sid,'io='+cookie_io,'csrftoken='+cookie_csrf]) 
  .send({ready:true})
  .end(function(err, res) {
    res.should.have.status(200);
    res.should.be.json;
    res.body.should.have.property('code');
    done();
  });

});

it('should exit current room /api/exit POST', function(done) {
   request(Url)
  .post('/api/exit')
  .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*\/*;q=0.8')
  .set('Content-Type', 'application/json')
  .set('Accept-Encoding','gzip, deflate')
  .set('Accept-Language','zh-CN,zh;q=0.8')
  .set('Cookie',['connect.sid='+cookie_sid,'io='+cookie_io,'csrftoken='+cookie_csrf]) 
  .end(function(err,res) {
              res.should.have.status(200);
              res.should.be.json;
              res.body.should.have.property('code');
              res.body.code.should.equal(0);
              done();
          });

});

});

