var request = require('request')
  , envConfig = require('../env-config')
  , HOST = envConfig.urls.dashboard
  , expect = require('expect.js');

describe('dashboard.angularjs.org', function () {
  it('Should be online', function (done) {
    request(HOST, function (err, res, body) {
      expect(body).to.contain("AngularJS Dashboard");
      done();
    });
  });
});