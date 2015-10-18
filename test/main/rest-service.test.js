'use strict';

require('phantomjs-polyfill');
require('es6-promise');
let BaseRESTService = require('../../src/BaseRESTService');
let expect = require('chai').expect;
var backend = require('mocked-backend');

//backend.defaults.delay = 100;

describe('REST Service', () => {

  it('should exist', () => {
    expect(BaseRESTService).to.exist;
  });

  it('should be a constructor', () => {
    expect(new BaseRESTService).to.be.instanceOf(BaseRESTService);
  });

  it('should return a constructor method `service`', () => {
    let RESTService = new BaseRESTService();
    let UserService = new RESTService.service('/user', {});
    expect(UserService).to.exist;
  });

  it('should create methods for each configuration from parameter', () => {
    let RESTService = new BaseRESTService();
    let UserService = new RESTService.service('/user', {
      findOne: {},
      find: {},
      create: {}
    });
    expect(UserService.findOne).to.exist;
    expect(UserService.find).to.exist;
    expect(UserService.create).to.exist;
  });

  describe('requests', () => {

    let UserService;

    before(() => {
      let RESTService = new BaseRESTService({
        exclude: ['id', 'createdAt']
      });
      UserService = RESTService.service('/user/:id', {
        findOne: {
          method: 'GET'
        },
        find: {
          method: 'GET'
        },
        update: {
          method: 'PUT'
        },
        findMe: {
          method: 'GET',
          params: {
            id: 'me'
          }
        }
      });
    });

    it('should do ajax request', (done) => {
      backend.expectGET('http://localhost/user').respond(200, {users: []}, true);
      UserService.find().then(res => {
        expect(res.users).to.be.an('array');
        done();
      });
      backend.flush();
      backend.verifyNoOutstandingExpectation()
    });

    it('should do add rest parameters to uri', (done) => {
      backend.expectGET('http://localhost/user/42').respond(200, {users: []}, true);
      UserService.findOne({
        id: 42
      }).then(res => {
        expect(res.users).to.be.an('array');
        done();
      });
      backend.flush();
      backend.verifyNoOutstandingExpectation()
    });

    it('should not send rest parameters with payload', (done) => {
      backend.expectPUT('http://localhost/user/42', {}).respond(200, {updated: 'ok'}, true);
      UserService.update({
        id: 42
      }).then(res => {
        expect(res.updated).to.be.equal('ok');
        done();
      });
      backend.flush();
      backend.verifyNoOutstandingExpectation()
    });

    it('should send non rest parameters with payload', (done) => {
      backend.expectPUT('http://localhost/user/42', {
        name: 'Ann Levenhook'
      }).respond(200, {updated: 'ok'}, true);
      UserService.update({
        id: 42
      }, {
        name: 'Ann Levenhook'
      }).then(res => {
        expect(res.updated).to.be.equal('ok');
        done();
      });
      backend.flush();
      backend.verifyNoOutstandingExpectation()
    });

    it('should not send excluded fields with payload', (done) => {
      backend.expectPUT('http://localhost/user/42', {
        name: 'Ann Levenhook'
      }).respond(200, {updated: 'ok'}, true);
      UserService.update({
        id: 42
      }, {
        name: 'Ann Levenhook',
        id: 42,
        createdAt: 'yesterday'
      }).then(res => {
        expect(res.updated).to.be.equal('ok');
        done();
      });
      backend.flush();
      backend.verifyNoOutstandingExpectation()
    });

    it('should send body as query string when req method is GET', (done) => {
      // TODO:
      expect(false).to.be.true;
      backend.expectGET('http://localhost/user?', {
        name: {$in: ['Ann Levenhook', 'Chris Levenhook']}
      }).respond(200, {updated: 'ok'}, true);
      UserService.find({}, {
        name: {$in: ['Ann Levenhook', 'Chris Levenhook']}
      }).then(res => {
        expect(res.updated).to.be.equal('ok');
        done();
      });
      backend.flush();
      backend.verifyNoOutstandingExpectation()
    });

    it('should replace rest param with one provided in method config', done => {
      backend.expectGET('http://localhost/user/me').respond(200, {}, true);
      UserService.findMe().then(res => {
        done();
      });
      backend.flush();
      backend.verifyNoOutstandingExpectation()
    });

    it('should not replace rest param with method conf defaults if parameter passes as an argument', done => {
      backend.expectGET('http://localhost/user/42').respond(200, {}, true);
      UserService.findMe({
        id: 42
      }).then(res => {
        done();
      });
      backend.flush();
      backend.verifyNoOutstandingExpectation()
    });




  });


});
