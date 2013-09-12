describe('docs.angularjs.org', function () {
  var protractor = require('protractor')
    , tractor = protractor.getInstance()
    , envConfig = require('../server/config/env-config')
    , HOST = envConfig.urls.docs
    , request = require('request')
    , parseXML = require('xml2js').parseString
    , fs = require('fs')
    , protractorConfig = require('../protractorConf.js');

  request.defaults({
    timeout: protractorConfig.config.jasmineNodeOpts.defaultTimeoutInterval
  });

  function queryCss (selector) {
    return tractor.findElement(protractor.By.css(selector));
  }

  describe('Pushstate', function () {
    it('should rewrite /guide to index.html', function () {
      tractor.get(HOST + '/guide');
      var introParagraph = tractor.findElement(protractor.By.css('.content p'));
      expect(introParagraph.getText()).toContain('Welcome to the angular Developer Guide.');
    });


    it('should rewrite /guide/directive to index.html', function () {
      tractor.get(HOST + '/guide/directive');
      var introParagraph = tractor.findElement(protractor.By.css('.content p'));
      expect(introParagraph.getText()).toContain('Directives are a way to teach HTML new tricks.');
    });


    it('should rewrite /api to index.html', function () {
      tractor.get(HOST + '/api');
      var introParagraph = tractor.findElement(protractor.By.css('.content p'));
      introParagraph.getText().then(function (text) {
        expect(text).toContain('Use the API Reference documentation');
      });
    });


    it('should rewrite /api/ng.directive:ngApp to index.html', function () {
      tractor.get(HOST + '/api/ng.directive:ngApp');
      var introParagraph = tractor.findElement(protractor.By.css('.content p'));
      expect(introParagraph.getText()).toContain('Use this directive to auto-bootstrap an application.');
    });


    it('should rewrite /cookbook to index.html', function () {
      tractor.get(HOST + '/cookbook');
      var introParagraph = tractor.findElement(protractor.By.css('.content p'));
      expect(introParagraph.getText()).toContain('Welcome to the Angular cookbook');
    });


    it('should rewrite /cookbook/form to index.html', function () {
      tractor.get(HOST + '/cookbook/form');
      var introParagraph = tractor.findElement(protractor.By.css('.content p'));
      expect(introParagraph.getText()).toContain('For this reason Angular strives to make both of these operations trivial.');
    });


    it('should rewrite /misc/contribute to index.html', function () {
      tractor.get(HOST + '/misc/contribute');
      var introParagraph = tractor.findElement(protractor.By.css('.content'));
      expect(introParagraph.getText()).toContain('AngularJS is an open source project licensed under the');
    });


    it('should rewrite /tutorial to index.html', function () {
      tractor.get(HOST + '/tutorial');
      var introParagraph = tractor.findElement(protractor.By.css('.content p'));
      expect(introParagraph.getText()).toContain('A great way to get introduced to AngularJS is to work through this tutorial');
    });


    it('should rewrite /tutorial/step_01 to index.html', function () {
      tractor.get(HOST + '/tutorial/step_01');
      var introParagraph = tractor.findElement(protractor.By.css('.content p'));
      expect(introParagraph.getText()).toContain('In order to illustrate how Angular enhances standard HTML');
    });


    it('should rewrite /error to index.html', function () {
      tractor.get(HOST + '/error');
      var introParagraph = tractor.findElement(protractor.By.css('.content p'));
      expect(introParagraph.getText()).toContain('Use the Error Reference manual');
    });


    it('should rewrite /error/ng:cpi to index.html', function () {
      tractor.get(HOST + '/error/ng:cpi');
      var errorPre = tractor.findElement(protractor.By.css('.minerr-errmsg'));
      expect(errorPre.getText()).toContain('Source and destination are identical.');
    });
  });


  describe('Bad Deep Urls', function () {
    it('should return 404 for /api/api', function () {
      request(HOST + '/api/api', function (err, res, body) {
        expect(res.statusCode).toEqual(404);
      });
    });


    it('should return 404 for /api/tutorial', function () {
      request(HOST + '/api/tutorial', function (err, res, body) {
        expect(res.statusCode).toEqual(404);
      });
    });


    it('should return 404 for /tutorial/guide', function () {
      request(HOST + '/tutorial/guide', function (err, res, body) {
        expect(res.statusCode).toEqual(404);
      });
    });


    it('should return 404 for /misc/tutorial', function () {
      request(HOST + '/misc/tutorial', function (err, res, body) {
        expect(res.statusCode).toEqual(404);
      });
    });
  })


  describe('Crawlability', function () {
    it('should return a partial when requesting /?_escaped_fragment_=/api/angular.bind', function () {
      request(HOST + '/?_escaped_fragment_=/api/angular.bind', function (err, res, body) {
        expect(body).toContain('Returns a function which calls function');
        expect(body).toContain('angular.bind')
      });
    });


    it('should return a partial when requesting /?_escaped_fragment_=/api/ng.directive:ngMouseover', function () {
      request(HOST + '/?_escaped_fragment_=/api/ng.directive:ngMouseover', function (err, res, body) {
        expect(body).toContain('Specify custom behavior on mouseover event.');
        expect(body).toContain('ngMouseover')
      });
    });


    describe('_escaped_fragment_ Title Tags', function () {
      it('should return an appropriate title when path contains : ', function () {
        request(HOST + '?_escaped_fragment_=/api/ng.directive:ngRepeat', function (err, res, body) {
          var title = /<title>(.*)<\/title>/.exec(body)[1];
          expect(title).toContain('AngularJS Documentation for ngRepeat');
        });
      });


      it('should return an appropriate title when path contains . ', function () {
        request(HOST + '/?_escaped_fragment_=/api/ng.$rootScope.Scope', function (err, res, body) {
          var title = /<title>(.*)<\/title>/.exec(body)[1];
          expect(title).toContain('AngularJS Documentation for Scope');
        });
      });


      it('should return an appropriate title when path contains no special characters', function () {
        request(HOST + '?_escaped_fragment_=/api/ngSanitize', function (err, res, body) {
          var title = /<title>(.*)<\/title>/.exec(body)[1];
          expect(title).toContain('AngularJS Documentation for ngSanitize');
        });
      });
    });


    it('should return a partial when requesting /api/ng.directive:ngHref?_escaped_fragment_', function () {
      request(HOST + '/api/ng.directive:ngHref?_escaped_fragment_', function (err, res, body) {
        expect(body).toContain('Using Angular markup like');
      });
    });


    it('should return a partial when requesting /api/ng.directive:ngHref?_escaped_fragment_=', function () {
      request(HOST + '/api/ng.directive:ngHref?_escaped_fragment_=', function (err, res, body) {
        expect(body).toContain('Using Angular markup like');
      });
    });


    it('should return a partial when requesting /guide/overview?_escaped_fragment_=', function () {
      request(HOST + '/guide/overview?_escaped_fragment_=', function (err, res, body) {
        expect(body).toContain('AngularJS is a structural framework for dynamic web apps');
      });
    });


    it('should return a partial when requesting /', function () {
      request(HOST + '?_escaped_fragment_=', function (err, res, body) {
        expect(body).toContain('Use the API Reference documentation when you need more information');
      });
    });


    it('should return a partial when requesting /guide?_escaped_fragment_=', function () {
      request(HOST + '/guide?_escaped_fragment_=', function (err, res, body) {
        expect(body).toContain('Welcome to the angular Developer Guide.');
      });
    });


    it('should return a partial when requesting /guide/?_escaped_fragment_=', function () {
      request(HOST + '/guide/?_escaped_fragment_=', function (err, res, body) {
        expect(body).toContain('Welcome to the angular Developer Guide.');
      });
    });


    it('should return a partial when requesting /cookbook/?_escaped_fragment_=', function () {
      request(HOST + '/cookbook/?_escaped_fragment_=', function (err, res, body) {
        expect(body).toContain('Welcome to the Angular cookbook.');
      });
    });


    it('should return a partial when requesting /tutorial/?_escaped_fragment_=', function () {
      request(HOST + '/tutorial/?_escaped_fragment_=', function (err, res, body) {
        expect(body).toContain('A great way to get introduced to AngularJS is to work through this tutorial');
      });
    });


    it('should return a 404 status code for bogus _escaped_fragment_ urls', function () {
      request(HOST + '/misc/tutorial/api/guide/misc/misc/%7B%7Bmodule.url%7D%7D?_escaped_fragment_=', function (err, res, body) {
        expect(res.statusCode).toEqual(404);
      });
    });


    it('should return a 404 status code for deep paths such as /tutorial/tutorial/api?_escaped_fragment_=', function () {
      request(HOST + '/tutorial/tutorial/api?_escaped_fragment_=', function (err, res, body) {
        expect(res.statusCode).toEqual(404);
      });
    });


    it('should not 404 for sitemap URLs', function () {
      request(HOST + '/sitemap.xml', function (err, res, sitemap) {
        var queueCount = 0, finishedCount = 0;

        parseXML(sitemap, function (err, parsed) {
          parsed.urlset.url.forEach(function (url) {
            var reqUrl = url.loc[0].replace('http://docs.angularjs.org', HOST);
            queueCount++
            request(reqUrl, function (err, res, body) {
              finishedCount++;

              expect(res.statusCode).toEqual(200);
              expect(body).toContain('API Reference');

              if (queueCount === finishedCount) {
              }
            });
          });
        });
      });
    });
  });


  describe('App', function () {
    it('should filter the module list when searching', function () {
      tractor.get(HOST);
      var search = tractor.findElement(protractor.By.input('search'));
      search.sendKeys('ngBind');

      var firstModule = tractor.findElement(protractor.By.css('[ng-repeat^="page in module.directives"] a'));
      expect(firstModule.getText()).toEqual('ngBind');
    });


    it('should change the page content when clicking a module from the left', function () {
      tractor.get(HOST);
      var ngBindLink = tractor.findElement(protractor.By.css('a[href="api/ng.directive:ngBind"]'))
      ngBindLink.click();

      var pageBody = tractor.findElement(protractor.By.css('.content h1 code'));
      expect(pageBody.getText()).toEqual('ngBind');
    });


    it('should show the functioning input directive example', function () {
      tractor.get(HOST + '/api/ng.directive:input');
      var nameInput = tractor.findElement(protractor.By.input('user.name'));
      nameInput.click();
      nameInput.sendKeys('!!!');

      var code = tractor.findElement(protractor.By.css('.doc-example-live tt'));
      expect(code.getText()).toContain('guest!!!');
    });
  });
})
