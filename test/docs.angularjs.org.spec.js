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
    it('should rewrite /guide to index.html', function (done) {
      tractor.get(HOST + '/guide');
      var introParagraph = queryCss('.content p');
      introParagraph.getText().then(function (text) {
        expect(text).toContain('Welcome to the angular Developer Guide.');
        done();
      });
    });

    it('should rewrite /guide/directive to index.html', function (done) {
      tractor.get(HOST + '/guide/directive');
      var introParagraph = queryCss('.content p');
      introParagraph.getText().then(function (text) {
        expect(text).toContain('Directives are a way to teach HTML new tricks.');
        done();
      });

    });

    it('should rewrite /api to index.html', function (done) {
      tractor.get(HOST + '/api');
      var introParagraph = queryCss('.content p');
      introParagraph.getText().then(function (text) {
        expect(text).toContain('Use the API Reference documentation');
        done();
      });
    });

    it('should rewrite /api/ng.directive:ngApp to index.html', function (done) {
      tractor.get(HOST + '/api/ng.directive:ngApp');
      var introParagraph = queryCss('.content p');
      introParagraph.getText().then(function (text) {
        expect(text).toContain('Use this directive to auto-bootstrap an application.');
        done();
      });
    });

    it('should rewrite /cookbook to index.html', function (done) {
      tractor.get(HOST + '/cookbook');
      var introParagraph = queryCss('.content p');
      introParagraph.getText().then(function (text) {
        expect(text).toContain('Welcome to the Angular cookbook');
        done();
      });
    });

    it('should rewrite /cookbook/form to index.html', function (done) {
      tractor.get(HOST + '/cookbook/form');
      var introParagraph = queryCss('.content p');
      introParagraph.getText().then(function (text) {
        expect(text).toContain('For this reason Angular strives to make both of these operations trivial.');
        done();
      });
    });

    it('should rewrite /misc/contribute to index.html', function (done) {
      tractor.get(HOST + '/misc/contribute');
      var introParagraph = queryCss('.content');
      introParagraph.getText().then(function (text) {
        expect(text).toContain('AngularJS is an open source project licensed under the');
        done();
      });
    });

    it('should rewrite /tutorial to index.html', function (done) {
      tractor.get(HOST + '/tutorial');
      var introParagraph = queryCss('.content p');
      introParagraph.getText().then(function (text) {
        expect(text).toContain('A great way to get introduced to AngularJS is to work through this tutorial');
        done();
      });
    });

    it('should rewrite /tutorial/step_01 to index.html', function (done) {
      tractor.get(HOST + '/tutorial/step_01');
      var introParagraph = queryCss('.content p');
      introParagraph.getText().then(function (text) {
        expect(text).toContain('In order to illustrate how Angular enhances standard HTML');
        done();
      });
    });

    it('should rewrite /error to index.html', function (done) {
      tractor.get(HOST + '/error');
      var introParagraph = queryCss('.content p');
      introParagraph.getText().then(function (text) {
        expect(text).toContain('Use the Error Reference manual');
        done();
      });
    });

    it('should rewrite /error/ng:cpi to index.html', function (done) {
      tractor.get(HOST + '/error/ng:cpi');
      var errorPre = queryCss('.minerr-errmsg');
      errorPre.getText().then(function (text) {
        expect(text).toContain('Source and destination are identical.');
        done();
      });
    });
  });
  describe('Bad Deep Urls', function () {
    it('should return 404 for /api/api', function (done) {
      request(HOST + '/api/api', function (err, res, body) {
        expect(res.statusCode).toEqual(404);
        done();
      });
    });
    it('should return 404 for /api/tutorial', function (done) {
      request(HOST + '/api/tutorial', function (err, res, body) {
        expect(res.statusCode).toEqual(404);
        done();
      });
    });
    it('should return 404 for /tutorial/guide', function (done) {
      request(HOST + '/tutorial/guide', function (err, res, body) {
        expect(res.statusCode).toEqual(404);
        done();
      });
    });
    it('should return 404 for /misc/tutorial', function (done) {
      request(HOST + '/misc/tutorial', function (err, res, body) {
        expect(res.statusCode).toEqual(404);
        done();
      });
    });
  })

  describe('Crawlability', function () {

    it('should return a partial when requesting /?_escaped_fragment_=/api/angular.bind', function (done) {
      request(HOST + '/?_escaped_fragment_=/api/angular.bind', function (err, res, body) {
        expect(body).toContain('Returns a function which calls function');
        expect(body).toContain('angular.bind')
        done();
      });
    });

    it('should return a partial when requesting /?_escaped_fragment_=/api/ng.directive:ngMouseover', function (done) {
      request(HOST + '/?_escaped_fragment_=/api/ng.directive:ngMouseover', function (err, res, body) {
        expect(body).toContain('Specify custom behavior on mouseover event.');
        expect(body).toContain('ngMouseover')
        done();
      });
    });

    describe('_escaped_fragment_ Title Tags', function () {
      it('should return an appropriate title when path contains : ', function (done) {
        request(HOST + '?_escaped_fragment_=/api/ng.directive:ngRepeat', function (err, res, body) {
          var title = /<title>(.*)<\/title>/.exec(body)[1];
          expect(title).toContain('AngularJS Documentation for ngRepeat');
          done();
        });
      });

      it('should return an appropriate title when path contains . ', function (done) {
        request(HOST + '/?_escaped_fragment_=/api/ng.$rootScope.Scope', function (err, res, body) {
          var title = /<title>(.*)<\/title>/.exec(body)[1];
          expect(title).toContain('AngularJS Documentation for Scope');
          done();
        });
      });

      it('should return an appropriate title when path contains no special characters', function (done) {
        request(HOST + '?_escaped_fragment_=/api/ngSanitize', function (err, res, body) {
          var title = /<title>(.*)<\/title>/.exec(body)[1];
          expect(title).toContain('AngularJS Documentation for ngSanitize');
          done();
        });
      });
    })

    it('should return a partial when requesting /api/ng.directive:ngHref?_escaped_fragment_', function (done) {
      request(HOST + '/api/ng.directive:ngHref?_escaped_fragment_', function (err, res, body) {
        expect(body).toContain('Using Angular markup like');
        done();
      });
    });

    it('should return a partial when requesting /api/ng.directive:ngHref?_escaped_fragment_=', function (done) {
      request(HOST + '/api/ng.directive:ngHref?_escaped_fragment_=', function (err, res, body) {
        expect(body).toContain('Using Angular markup like');
        done();
      });
    });

    it('should return a partial when requesting /guide/overview?_escaped_fragment_=', function (done) {
      request(HOST + '/guide/overview?_escaped_fragment_=', function (err, res, body) {
        expect(body).toContain('AngularJS is a structural framework for dynamic web apps');
        done();
      });
    });

    it('should return a partial when requesting /', function (done) {
      request(HOST + '?_escaped_fragment_=', function (err, res, body) {
        expect(body).toContain('Use the API Reference documentation when you need more information');
        done();
      });
    });

    it('should return a partial when requesting /guide?_escaped_fragment_=', function (done) {
      request(HOST + '/guide?_escaped_fragment_=', function (err, res, body) {
        expect(body).toContain('Welcome to the angular Developer Guide.');
        done();
      });
    });

    it('should return a partial when requesting /guide/?_escaped_fragment_=', function (done) {
      request(HOST + '/guide/?_escaped_fragment_=', function (err, res, body) {
        expect(body).toContain('Welcome to the angular Developer Guide.');
        done();
      });
    });

    it('should return a partial when requesting /cookbook/?_escaped_fragment_=', function (done) {
      request(HOST + '/cookbook/?_escaped_fragment_=', function (err, res, body) {
        expect(body).toContain('Welcome to the Angular cookbook.');
        done();
      });
    });

    it('should return a partial when requesting /tutorial/?_escaped_fragment_=', function (done) {
      request(HOST + '/tutorial/?_escaped_fragment_=', function (err, res, body) {
        expect(body).toContain('A great way to get introduced to AngularJS is to work through this tutorial');
        done();
      });
    });

    it('should return a 404 status code for bogus _escaped_fragment_ urls', function (done) {
      request(HOST + '/misc/tutorial/api/guide/misc/misc/%7B%7Bmodule.url%7D%7D?_escaped_fragment_=', function (err, res, body) {
        expect(res.statusCode).toEqual(404);
        done();
      });
    });

    it('should return a 404 status code for deep paths such as /tutorial/tutorial/api?_escaped_fragment_=', function (done) {
      request(HOST + '/tutorial/tutorial/api?_escaped_fragment_=', function (err, res, body) {
        expect(res.statusCode).toEqual(404);
        done();
      });
    });

    it('should not 404 for sitemap URLs', function (done) {
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
                done();
              }
            });
          });
        });
      });
    });
  });

  describe('App', function () {
    it('should filter the module list when searching', function (done) {
      tractor.get(HOST);
      var search = tractor.findElement(protractor.By.input('search'));
      search.sendKeys('ngBind').then(function () {
        var firstModule = queryCss('[ng-repeat^="page in module.directives"] a');
        firstModule.getText().then(function (text) {
          expect(text).toEqual('ngBind');
          done();
        });
      });
    });

    it('should change the page content when clicking a module from the left', function (done) {
      tractor.get(HOST);
      var ngBindLink = queryCss('a[href="api/ng.directive:ngBind"]')
      ngBindLink.click().then(function () {
        //Wait for content to load
        var pageBody = queryCss('.content h1 code');
        pageBody.getText().then(function (text) {
          expect(text).toEqual('ngBind');
          done();
        });
      });
    });

    it('should show the functioning input directive example', function (done) {
      tractor.get(HOST + '/api/ng.directive:input');
      var nameInput = tractor.findElement(protractor.By.input('user.name'));
      nameInput.click();
      nameInput.sendKeys('!!!');
      nameInput.getAttribute('type').then(function (value) {
        var code = queryCss('.doc-example-live tt');
        code.getText().then(function (text) {
          expect(text).toContain('guest!!!');
          done();
        });
      })
    });

    it('should show the functioning radio directive example', function (done) {
      tractor.get(HOST + '/api/ng.directive:input.radio');
      var redBtn = queryCss('form[name="myForm"] input[value="red"]');

      redBtn.click();
      var liveCode = queryCss('.doc-example-live tt');
      liveCode.getText().then(function (text) {
        expect(text).toContain('color = red');
        done();
      });
    });
  });
})
