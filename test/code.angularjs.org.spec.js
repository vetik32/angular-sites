describe('code.angularjs.org', function () {
  var protractor = require('protractor')
    , tractor = protractor.getInstance()
    , envConfig = require('../server/config/env-config')
    , HOST = envConfig.urls.code
    , request = require('request')
    , parseXML = require('xml2js').parseString;
  
  describe('Rewrites', function () {
    it('should provide angular js for the version specified at root url', function (done) {
      request(HOST + '/angular-0.10.0.js', function (err, res, body) {
        expect(body).toContain('AngularJS v0.10.0');
        done();
      });
    });

    it('should rewrite wildcard API docs versions to the appropriate index.html', function (done) {
      request(HOST + '/1.1.4/docs/api/ng.directive:ngAnimate', function (err, res, body) {
        expect(body).toContain('AngularJS is what HTML would have been');
        done();
      });
    });

    it('should render the index when requesting the root of /version/docs', function (done) {
      tractor.get(HOST + '/1.1.4/docs/');
      var version = tractor.findElement(protractor.By.css('a#version'));
      version.getText().then(function (text) {
        expect(text).toEqual('v1.1.4 quantum-manipulation');
        done();
      });
    })

    it('should rewrite docs.* to /snapshot/docs/*', function (done) {
      request(envConfig.urls.docs, function (err, res, body) {
        expect(body).toContain('AngularJS is what HTML would have been, had it been designed for building web-apps.');
        done();
      });
    });
  });

  describe('Git Update', function () {
    it('should fetch the latest from github when hitting /gitFetchSite.php', function (done) {
      request(HOST + '/gitFetchSite.php', function (err, res, body) {
        expect(body).toContain('commit');
        expect(body).toContain('Author:');
        expect(body).toContain('Date:');
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
          expect(commit).toBeTruthy();

          request(HOST + '/gitFetchSite.log', function (err, res, body) {
            expect(body).toContain(commit);
            done();
          });
        });
      });
    });
  });

  describe('Directory Listing', function () {
    var link;

    it('should show a list of files when requesting the root', function (done) {
      request(HOST, function (err, res, body) {
        expect(body).toContain('href="0.9.0');
        done();
      });
    });

    it('should navigate to a directory for a code version', function (done) {
      request(HOST + '/0.9.0/', function (err, res, body) {
        expect(body).toContain('angular-0.9.0.js');
        done();
      });
    });

    it('should render index.html for request to /snapshot/docs', function (done) {
      request(HOST + '/snapshot/docs', function (err, res, body) {
        expect(body).not.toContain('Index of /');
        expect(body).toContain('AngularJS is what HTML would have been');
        done();
      });
    });
  });
});