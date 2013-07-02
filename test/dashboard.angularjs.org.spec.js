var request = require('request')
  , envConfig = require('../server/config/env-config')
  , HOST = envConfig.urls.dashboard;

describe('dashboard.angularjs.org', function () {
  it('Should be online', function (done) {
    request(HOST, function (err, res, body) {
      expect(body).toContain("AngularJS Dashboard");
      done();
    });
  });
});