var expect = require('expect.js')
  , envConfig
  , request = require('request');

describe('blog.angularjs.org', function () {
  it('should load the blog', function (done) {
    request(require('../server/config/env-config').urls.blog, function (err, res, body) {
      expect(body).to.contain('Blogger');
      expect(body).to.contain('AngularJS');
      done();
    })
  });
})