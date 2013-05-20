var request = require('request')
  , HOST = envConfig.urls.ci
  , expect = require('expect.js');

describe('Ci.AngularJS.org', function () {
  describe('Jenkins', function () {
    it('should load Jenkins', function (done) {
      request(HOST, function (err, res, body) {
        expect(body).to.contain('Build Queue');
        expect(body).to.contain('Jenkins');
        done();
      });
    });
  });
});