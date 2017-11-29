var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var should = chai.should();
var app = require('../app');
var server = require('../app').server;   
var expect = chai.expect;
   
var assert = chai.assert; 

var Browser = require('zombie');

describe("Login Test",function () {
  before(function (done) {
    server.close();
    done();
  });
  
  after(function (done) {
    server.close();
    done();
  });

  this.timeout(40000);
  it("should login with facebook",function (done) {   
          Browser.visit('https://www.facebook.com/login.php?skip_api_login=1&api_key=1454215388009966&signed_next=1&next=https%3A%2F%2Fwww.facebook.com%2Fv2.10%2Fdialog%2Foauth%3Fredirect_uri%3Dhttp%253A%252F%252Fguessmydrawing.fun%252Fusers%252Fcallback%26response_type%3Dcode%26client_id%3D1454215388009966%26ret%3Dlogin%26logger_id%3Db0bfbd0a-64a2-543e-6484-c8c69d9861f0&cancel_url=http%3A%2F%2Fguessmydrawing.fun%2Fusers%2Fcallback%3Ferror%3Daccess_denied%26error_code%3D200%26error_description%3DPermissions%2Berror%26error_reason%3Duser_denied%23_%3D_&display=page&locale=zh_CN&logger_id=b0bfbd0a-64a2-543e-6484-c8c69d9861f0', function(err, brw) {  
            if(err){
                throw err;
            }
            assert.equal(brw.location.pathname, '/login.php');
            brw.fill('email','15244664776@163.com').fill('pass', 'password1234')
                .pressButton('login', function (err,brow) {
                    brw.assert.success();    
                    const request = require('supertest');
                    done();
                });
            done();
           });
  
      });
});
