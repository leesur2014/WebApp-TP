var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var should = chai.should();
var app = require('../app');
var expect = chai.expect;
var server = require('../app').server;   
var assert = chai.assert;      
var Url = 'http://localhost:3000';
//var Url = 'http://guessmydrawing.fun';

var cookie_sid = 's%3AmGQ77F9dWJDXDL2QQ29AGKOO3EVmpBwb.N5nlUsctTV9HKIWwVo1bL1X3bHMXDUhfQ5jlxVuNeCw';
var cookie_io = '5-wpp5xh1S6rvbrgAAAA';
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
            res.body.data.should.have.property('online');
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

var cookie_sid2 = 's%3AbUtTTt-wE6s6gHHo1WCkgOhNIRXdvPec.s4oGsz3OXADPzi5HPOdvJXEtH3y4nisN3ex4YBjBS4o';
var cookie_io2 = 'HYw3PS1xOMaiLn8qAACI';
//it('should enter room as player /api/enter POST', function(done) {
//  request(Url)
//  .get('/api/enter')
//  .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*\/*;q=0.8')
//  .set('Content-Type', 'application/json')
//  .set('Accept-Encoding','gzip, deflate')
//  .set('Accept-Language','zh-CN,zh;q=0.8')
//  .set('Cookie',['connect.sid='+cookie_sid,'io='+cookie_io,'csrftoken='+cookie_csrf]) 
//  .send({room_id:curr_room_id})
//  .end(function(err,res) {
//    res.should.have.status(200);
//    res.should.be.json;
//    res.body.should.have.property('data');
//    res.body.data.should.have.property('id');
//    res.body.data.should.have.property('user_count');
//    res.body.data.should.have.property('player_count');
//    res.body.data.should.have.property('round_id');
//    done();
//  });
//});

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


//it('should get another user ready /api/ready POST', function(done) {
//   request(Url)
//  .post('/api/ready')
//  .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*\/*;q=0.8')
//  .set('Content-Type', 'application/json')
//  .set('Accept-Encoding','gzip, deflate')
//  .set('Accept-Language','zh-CN,zh;q=0.8')
//  .set('Cookie',['connect.sid='+cookie_sid2,'io='+cookie_io2,'csrftoken='+cookie_csrf]) 
//  .send({ready:true})
//  .end(function(err, res) {
//    res.should.have.status(200);
//    res.should.be.json;
//    res.body.should.have.property('code');
//    done();
//  });
//});


var passed_round_id;
//it('should get info of current round /api/round GET', function(done) {
//   request(Url)
//           .get('/api/round')
//           .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*\/*;q=0.8')
//           .set('Content-Type', 'application/json')
//           .set('Accept-Encoding','gzip, deflate')
//           .set('Accept-Language','zh-CN,zh;q=0.8')
//           .set('Cookie',['connect.sid='+cookie_sid,'io='+cookie_io,'csrftoken='+cookie_csrf])
//        .end(function(err,res) {
//            res.should.have.status(200);
//            res.should.be.json;
//            res.body.should.have.property('code');
//            res.body.should.have.property('data');
//            res.body.data.should.have.property('id');
//            passed_round_id = res.body.data.id;
//            res.body.data.should.have.property('painter_id');
//            res.body.data.should.have.property('room_id');
//            res.body.data.should.have.property('started_at');
//            res.body.data.should.have.property('ended_at');
//            res.body.data.should.have.property('answer');
//            done();
//        });
//});




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


it('should get a certain user info /api/user/{user_id} GET', function(done) {
   request(Url)
           .get('/api/user/'+curr_user_id)
           .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*\/*;q=0.8')
           .set('Content-Type', 'application/json')
           .set('Accept-Encoding','gzip, deflate')
           .set('Accept-Language','zh-CN,zh;q=0.8')
           .set('Cookie',['connect.sid='+cookie_sid,'io='+cookie_io,'csrftoken='+cookie_csrf])
        .end(function(err,res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('code');
            res.body.should.have.property('data');
            res.body.data.should.have.property('id');
            res.body.data.id.should.equal(curr_user_id);
            res.body.data.should.have.property('nickname');
            res.body.data.should.have.property('score_draw');
            res.body.data.should.have.property('score_guess');
            done();
        });
});

//passed_round_id = 1;
//it('should get info of past round /api/round/{round_id} GET', function(done) {
//   request(Url)
//           .get('/api/round/'+passed_round_id)
//           .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*\/*;q=0.8')
//           .set('Content-Type', 'application/json')
//           .set('Accept-Encoding','gzip, deflate')
//           .set('Accept-Language','zh-CN,zh;q=0.8')
//           .set('Cookie',['connect.sid='+cookie_sid,'io='+cookie_io,'csrftoken='+cookie_csrf])
//        .end(function(err,res) {
//            res.should.have.status(200);
//            res.should.be.json;
//            res.body.should.have.property('code');
//            res.body.should.have.property('data');
//            res.body.data.should.have.property('id');
//            res.body.data.id.should.equal(passed_round_id);
//            res.body.data.should.have.property('painter_id');
//            res.body.data.should.have.property('room_id');
//            res.body.data.should.have.property('started_at');
//            res.body.data.should.have.property('ended_at');
//            res.body.data.should.have.property('answer');
//            done();
//        });
//});

});

