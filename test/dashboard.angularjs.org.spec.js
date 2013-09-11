var request = require('request')
  , envConfig = require('../server/config/env-config')
  , HOST = envConfig.urls.dashboard
  , protractorConfig = require('../protractorConf.js');

request.defaults({
  timeout: protractorConfig.config.jasmineNodeOpts.defaultTimeoutInterval
});

describe('dashboard.angularjs.org', function () {
  it('Should be online', function (done) {
    request(HOST, function (err, res, body) {
      expect(body).toContain('ng-app="dashboardApp"');
      done();
    });
  });

  it('should fetch the latest source when hitting gitFetchSite.php', function (done) {
    request(HOST + '/gitFetchSite.php', function (err, res, body) {
      expect(err).toBeFalsy();
      expect(body).not.toContain('No input file specified.');
      expect(body).toContain('Update site from: GitHub master');
      expect(body).toContain('Author:');
      done();
    });
  }, 30000);
});
