var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var should = chai.should();
var app = require('../app');
var server = require('../app').server;   
var expect = chai.expect;
   
var assert = chai.assert;
var FacebookStrategy = require('passport-facebook').Strategy;
describe('Profile Test', function() {
  before(function (done) {
    server.close();
    done();
  });
  
  after(function (done) {
    server.close();
    done();
  });
    
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