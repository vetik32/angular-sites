var envConfig
  , request = require('request')
  , protractorConfig = require('../protractorConf.js');

request.defaults({
  timeout: protractorConfig.config.jasmineNodeOpts.defaultTimeoutInterval
});

describe('blog.angularjs.org', function () {
  it('should load the blog', function (done) {
    request(require('../server/config/env-config').urls.blog, function (err, res, body) {
      expect(body).toContain('Blogger');
      expect(body).toContain('AngularJS');
      done();
    })
  });
})