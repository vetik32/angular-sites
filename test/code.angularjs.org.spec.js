describe('code.angularjs.org', function () {
  var webdriver = require('selenium-webdriver')
  , expect = require('expect.js')
  , protractor = require('protractor')
  , driver = new webdriver.Builder().
      usingServer('http://localhost:4444/wd/hub').
      withCapabilities({
        'browserName': 'chrome',
        'version': '',
        'platform': 'ANY',
        'javascriptEnabled': true
      }).build()
  , tractor
  , envConfig = require('env-config')
  , HOST = envConfig.urls.code
  , request = require('request')
  , parseXML = require('xml2js').parseString;
  
  describe('Rewrites', function () {
    it('should provide angular js for the version specified at root url', function (done) {
      request(HOST + '/angular-0.10.0.js', function (err, res, body) {
        expect(body).to.contain('AngularJS v0.10.0');
        done();
      });
    });

    it('should rewrite docs.* to /snapshot/docs/*', function (done) {
      request('http://docs.angularjs.org', function (err, res, body) {
        expect(body).to.contain('AngularJS is what HTML would have been, had it been designed for building web-apps.');
        done();
      });
    });
  });

  describe('Git Update', function () {
    it('should fetch the latest from github when hitting /gitFetchSite.php', function (done) {
      request(HOST + '/gitFetchSite.php', function (err, res, body) {
        expect(body).to.contain('commit');
        expect(body).to.contain('Author:');
        expect(body).to.contain('Date:');
        done();
      });
    });

    it('should match the latest commit from the github master branch', function (done) {
      request('https://github.com/angular/code.angularjs.org/commits/master.atom', function (err, res, body) {
        if (err) done(err);

        parseXML(body, function (err, result) {
          //Get the most recent commit from the Github feed
          var latest = result.feed.entry[0];
          var commitPattern = /(?!Commit)\/.+$/;
          var commit = commitPattern.exec(latest.id)[0].replace('/','');
          expect(commit).to.be.ok();

          request(HOST + '/gitFetchSite.log', function (err, res, body) {
            expect(body).to.contain(commit);
            done();
          });
        });
      });
    });
  });

  describe('Directory Listing', function () {
    var link;
    before(function (done) {
      driver.get(HOST);
      done();
    });

    after(function (done) {
      driver.quit().then(function () {
        done();  
      });
    });

    it('should show a list of files when requesting the root', function (done) {
      link = driver.findElement(webdriver.By.css('[href="0.9.0/"]'));
      link.getText().then(function (text) {
        expect(text).to.equal('0.9.0/');
        done();
      });
    });

    it('should navigate to a directory for a code version', function (done) {
      driver.get(HOST + '/0.9.0/');
      var body = driver.findElement(protractor.By.tagName('body'));
      body.getText().then(function (text) {
        expect(text).to.contain('angular-0.9.0.js');
        done();
      });
    });
  });
});