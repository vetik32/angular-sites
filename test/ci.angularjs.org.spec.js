var request = require('request')
  , HOST = require('../server/config/env-config').urls.ci;

describe('Ci.AngularJS.org', function () {
  describe('Jenkins', function () {
    it('should load Jenkins', function (done) {
      request(HOST, function (err, res, body) {
        expect(body).toContain('Build Queue');
        expect(body).toContain('Jenkins');
        done();
      });
    });
  });
});