describe('code.angularjs.org', function () {
  var protractor = require('protractor')
    , tractor = protractor.getInstance()
    , envConfig = require('../server/config/env-config')
    , HOST = envConfig.urls.code
    , request = require('request')
    , parseXML = require('xml2js').parseString
    , protractorConfig = require('../protractorConf.js');

  request.defaults({
    timeout: protractorConfig.config.jasmineNodeOpts.defaultTimeoutInterval
  });


  describe('Rewrites', function () {
    it('should provide angular js for the version specified at root url', function () {
      request(HOST + '/angular-0.10.0.js', function (err, res, body) {
        expect(body).toContain('AngularJS v0.10.0');
      });
    });


    it('should support urls with letters in them, too', function () {
      request(HOST + '/1.2.0rc1/docs/api', function (err, res, body) {
        expect(body).toContain('AngularJS is what HTML would have been');
      });
    });


    it('should rewrite wildcard API docs versions to the appropriate index.html', function () {
      request(HOST + '/1.1.4/docs/api/ng.directive:ngAnimate', function (err, res, body) {
        expect(body).toContain('AngularJS is what HTML would have been');
      });
    });


    it('should render the index when requesting the root of /version/docs', function () {
      tractor.get(HOST + '/1.1.4/docs/');
      var version = tractor.findElement(protractor.By.css('a#version'));

      expect(version.getText()).toEqual('v1.1.4 quantum-manipulation');
    });


    it('should render the index when requesting the root of /version/docs/guide', function () {
      tractor.get(HOST + '/1.1.4/docs/guide');
      var version = tractor.findElement(protractor.By.css('a#version'));
      expect(version.getText()).toEqual('v1.1.4 quantum-manipulation');
    });


    it('should rewrite docs.* to /snapshot/docs/*', function () {
      request(envConfig.urls.docs, function (err, res, body) {
        expect(body).toContain('AngularJS is what HTML would have been, had it been designed for building web-apps.');
      });
    });


    it('should return the latest docs when requesting /snapshot/docs/api', function () {
      request(HOST + '/snapshot/docs/api', function (err, res, body) {
        expect(body).toContain('AngularJS is what HTML would have been, had it been designed for building web-apps.');
      });
    });


    it('should only rewrite paths that begin with /angular-x.x.x.js if the pattern is at the start of the string', function () {
      request(HOST + '/1.2.0-rc.2/angular-1.2.0-rc.2.zip', function (err, res, body) {
        expect(!err).toBe(true);
      });
    });
  });

  describe('Git Update', function () {
    it('should fetch the latest from github when hitting /gitFetchSite.php', function () {
      request(HOST + '/gitFetchSite.php', function (err, res, body) {
        expect(body).toContain('commit');
        expect(body).toContain('Author:');
        expect(body).toContain('Date:');
      });
    });

    it('should match the latest commit from the github master branch', function () {
      request('https://github.com/angular/code.angularjs.org/commits/master.atom', function (err, res, body) {
        if (err) throw err;

        parseXML(body, function (err, result) {
          //Get the most recent commit from the Github feed
          var latest = result.feed.entry[0];
          var commitPattern = /(?!Commit)\/.+$/;
          var commit = commitPattern.exec(latest.id)[0].replace('/','');
          expect(commit).toBeTruthy();

          request(HOST + '/gitFetchSite.log', function (err, res, body) {
            expect(body).toContain(commit);
          });
        });
      });
    });
  });


  describe('Directory Listing', function () {
    var link;

    it('should show a list of files when requesting the root', function () {
      request(HOST, function (err, res, body) {
        expect(body).toContain('href="0.9.0');
      });
    });


    it('should navigate to a directory for a code version', function () {
      request(HOST + '/0.9.0/', function (err, res, body) {
        expect(body).toContain('angular-0.9.0.js');
      });
    });


    it('should render index.html for request to /snapshot/docs', function () {
      request(HOST + '/snapshot/docs', function (err, res, body) {
        expect(body).not.toContain('Index of /');
        expect(body).toContain('AngularJS is what HTML would have been');
      });
    });
  });
});