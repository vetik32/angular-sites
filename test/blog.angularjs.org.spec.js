var expect = require('expect.js')
  , HOST = envConfig.urls.blog
  , request = require('request');

describe('blog.angularjs.org', function () {
  it('should load the blog', function (done) {
    request(HOST, function (err, res, body) {
      expect(body).to.contain('Blogger');
      expect(body).to.contain('AngularJS');
      done();
    })
  });
})