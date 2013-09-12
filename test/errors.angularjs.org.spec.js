var envConfig = require('../server/config/env-config')
  , HOST = envConfig.urls.errors
  , TARGET = envConfig.urls.docs.replace(/\:80$/, '')
  , request = require('request')
  , protractorConfig = require('../protractorConf.js');

request.defaults({
  timeout: protractorConfig.config.jasmineNodeOpts.defaultTimeoutInterval
});

describe('errors.angularjs.org', function () {
  var params = function (url) {
    return { url: url, followRedirect: false };
  };


  it('should redirect errors.angularjs.org to docs.angularjs.org/error', function () {
    request(params(HOST), function (error, response, body) {
      expect(response.headers.location).toEqual(TARGET + '/error/');
    });
  });


  it('should redirect errors.angularjs.org/ng:cpi to docs.angularjs.org/error/ng:cpi', function () {
    request(params(HOST + '/ng:cpi'), function (error, response, body) {
      expect(response.headers.location).toEqual(TARGET + '/error/ng:cpi');
    });
  });


  it('should redirect errors.angularjs.org/ng/cpi to docs.angularjs.org/error/ng:cpi', function () {
    request(params(HOST + '/ng/cpi'), function (error, response, body) {
      expect(response.headers.location).toEqual(TARGET + '/error/ng:cpi');
    });
  });


  it('should redirect errors.angularjs.org/v1.0.8/ng:cpi to docs.angularjs.org/error/ng:cpi', function () {
    request(params(HOST + '/v1.0.8/ng:cpi'), function (error, response, body) {
      expect(response.headers.location).toEqual(TARGET + '/error/ng:cpi');
    });
  });


  it('should redirect errors.angularjs.org/v1.0.8/ng/cpi to docs.angularjs.org/error/ng:cpi', function () {
    request(params(HOST + '/v1.0.8/ng/cpi'), function (error, response, body) {
      expect(response.headers.location).toEqual(TARGET + '/error/ng:cpi');
    });
  });
});
