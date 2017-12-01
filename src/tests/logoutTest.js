var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var should = chai.should();
var app = require('../app');
var server = require('../app').server;   
var Url = 'http://guessmydrawing.fun';

var cookie_sid = 's%3AAJ8LJx2kzxf8AbPJqw_3XlFKeN7BurQs.RgcAntEmAjBQK8rUtMhrURgJcJZsKEbuB03F%2BQc%2F93Y';
var cookie_io = 'M6cmQ35zFMM9-fQWAAAO';
var cookie_csrf = 'AwrHXaiD0A8gtU0S9aEGgrtjQcbUC22aXpUiyCldjZerPFa01xouJ44wj66oKcii';

const request = require('supertest');

describe('Logout Test', function() {
  it('should log out /users/logout GET', function(done) {
     request(Url)
    .get('/users/logout')
    .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*\/*;q=0.8')
    .set('Content-Type', 'application/json')
    .set('Accept-Encoding','gzip, deflate')
    .set('Accept-Language','zh-CN,zh;q=0.8')
    .set('Cookie',['connect.sid='+cookie_sid,'io='+cookie_io,'csrftoken='+cookie_csrf]) 
    .end(function(err,res) {
                res.should.have.status(200);
                res.should.be.json;
                done();
            });
  
  });
}