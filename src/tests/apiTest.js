
var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var should = chai.should();
var server = require('../app');
var expect = chai.expect;
   
var assert = chai.assert;       
    

var FacebookStrategy = require('passport-facebook').Strategy;
describe('Profile check', function() {
    var strategy = new FacebookStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});
  
    strategy._oauth2.get = function(url, accessToken, callback) {
      if (url != 'https://graph.facebook.com/v2.5/me') { return callback(new Error('incorrect url argument')); }
      if (accessToken != 'token') { return callback(new Error('incorrect token argument')); }
    
      var body = '{"id":"500308595","name":"Jared Hanson","first_name":"Jared","last_name":"Hanson","link":"http:\\/\\/www.facebook.com\\/jaredhanson","username":"jaredhanson","gender":"male","email":"jaredhanson\\u0040example.com"}';
      callback(null, body, undefined);
    };
    
    
    var profile;
    
    before(function(done) {
      strategy.userProfile('token', function(err, p) {
        if (err) { return done(err); }
        profile = p;
        done();
      });
    });
    
    it('should parse profile', function() {
        //console.log(strategy);
      expect(profile.provider).to.equal('facebook');     
      expect(profile.id).to.equal('500308595');
      expect(profile.username).to.equal('jaredhanson');
      expect(profile.displayName).to.equal('Jared Hanson');
      expect(profile.name.familyName).to.equal('Hanson');
      expect(profile.name.givenName).to.equal('Jared');
      expect(profile.gender).to.equal('male');
      expect(profile.profileUrl).to.equal('http://www.facebook.com/jaredhanson');
      expect(profile.emails).to.have.length(1);
      expect(profile.emails[0].value).to.equal('jaredhanson@example.com');
      expect(profile.photos).to.be.undefined;
    });

});

var Browser = require('zombie');
describe("API test",function () {
    this.timeout(40000);
    //beforeEach(function () {
      //browser = new Browser({ site: 'https://guessmydrawing.fun' });       
      it("should login with facebook",function (done) {   
            Browser.visit('https://www.facebook.com/login.php?skip_api_login=1&api_key=1454215388009966&signed_next=1&next=https%3A%2F%2Fwww.facebook.com%2Fv2.10%2Fdialog%2Foauth%3Fredirect_uri%3Dhttp%253A%252F%252Fguessmydrawing.fun%252Fusers%252Fcallback%26response_type%3Dcode%26client_id%3D1454215388009966%26ret%3Dlogin%26logger_id%3Db0bfbd0a-64a2-543e-6484-c8c69d9861f0&cancel_url=http%3A%2F%2Fguessmydrawing.fun%2Fusers%2Fcallback%3Ferror%3Daccess_denied%26error_code%3D200%26error_description%3DPermissions%2Berror%26error_reason%3Duser_denied%23_%3D_&display=page&locale=zh_CN&logger_id=b0bfbd0a-64a2-543e-6484-c8c69d9861f0', function(err, brw) {  
              if(err){
                  throw err;
              }
              //console.log(brw.location.pathname);
              assert.equal(brw.location.pathname, '/login.php');
              brw.fill('email','542785042@qq.com').fill('pass', '2030QWEqwe')
                  .pressButton('login', function (err,brow) {
                      brw.assert.success();    
                      const request = require('supertest');
                      done();
                  });
              done();
             });
    
        });
});
//});

/*
const request = require('supertest');
describe('Login API', function() {
    it('Should success if credential is valid', function(done) {
        request('http://guessmydrawing.fun')
        //request(server)
           .get('/users/login')
           //.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*\/*;q=0.8')
           .set('Content-Type', 'application/json')
           .set('Accept-Encoding','gzip, deflate')
           .set('Accept-Language','zh-CN,zh;q=0.8')
           .set('Connection','keep-alive')
           //.set('Cookie','connect.sid=s%3A3G9_Gdruq9XldPcG8bELAc2yGoDbrDNJ.lsygyYmyLE4rYK5FzeB%2BEsbT0Xey6LUkmZ%2FZHSFoyyg')
           .set('Cookie',['connect.sid=s%3A3G9_Gdruq9XldPcG8bELAc2yGoDbrDNJ.lsygyYmyLE4rYK5FzeB%2BEsbT0Xey6LUkmZ%2FZHSFoyyg'])
           .send({ fb_id: '123456', displayName: 'Mary White' })
           //.expect(200)
           //.expect('Content-Type', /json/)
           .expect(function(response) {
            //console.log(response);
              //expect(response.body).not.to.be.empty;
              //expect(response.body).to.be.an('object');
           })
           .end(done);
    }); 
});
*/
/*

describe('Draw_and_Guess', function() {
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

it('should get user info /api/me GET', function(done) {
   chai.request(server)
        .get('/api/me')
        .end(function(err,res) {
            console.log(res);
            //res.should.have.status(200);
            //res.should.be.jason;
            //res.body.should.have.property('nickname');
            //res.body.should.have.property('online');
            //res.body.online.should.equal('true');
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
*/