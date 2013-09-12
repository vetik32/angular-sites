var request = require('request')
  , envConfig = require('../server/config/env-config')
  , HOST = envConfig.urls.dashboard
  , protractorConfig = require('../protractorConf.js');

request.defaults({
  timeout: protractorConfig.config.jasmineNodeOpts.defaultTimeoutInterval
});

describe('dashboard.angularjs.org', function () {
  it('Should be online', function () {
    request(HOST, function (err, res, body) {
      expect(body).toContain('ng-app="dashboardApp"');
    });
  });

  it('should fetch the latest source when hitting gitFetchSite.php', function () {
    request(HOST + '/gitFetchSite.php', function (err, res, body) {
      expect(err).toBeFalsy();
      expect(body.indexOf('No input file specified.')).toBe(-1);
      expect(body).toContain('Update site from: GitHub master');
      expect(body).toContain('Author:');
    });
  }, 30000);
});
