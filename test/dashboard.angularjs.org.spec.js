var request = require('request')
  , HOST = 'http://dashboard.angularjs.org'
  , expect = require('expect.js');

describe('dashboard.angularjs.org', function () {
  it('Should be online', function (done) {
    request(HOST, function (err, res, body) {
      expect(body).to.contain("AngularJS Dashboard");
      done();
    });
  });
});