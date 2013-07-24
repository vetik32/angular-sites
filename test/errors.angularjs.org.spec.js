var envConfig = require('../server/config/env-config'),
  HOST = envConfig.urls.errors,
  TARGET = envConfig.urls.docs,
  request = require('request');

describe('errors.angularjs.org', function () {
  it('should redirect errors.angularjs.org to docs.angularjs.org/error', function (done) {
    request({ url: HOST, followRedirect: false }, function (error, response, body) {
      expect(response.headers.location).toEqual(TARGET + '/error/');
      done();
    });
  });

  it('should redirect errors.angularjs.org/ng:cpi to docs.angularjs.org/error/ng:cpi', function (done) {
    request({ url: HOST + '/ng:cpi', followRedirect: false }, function (error, response, body) {
      expect(response.headers.location).toEqual(TARGET + '/error/ng:cpi');
      done();
    });
  });

  it('should redirect errors.angularjs.org/ng/cpi to docs.angularjs.org/error/ng:cpi', function (done) {
    request({ url: HOST + '/ng/cpi', followRedirect: false }, function (error, response, body) {
      expect(response.headers.location).toEqual(TARGET + '/error/ng:cpi');
      done();
    });
  });
});
