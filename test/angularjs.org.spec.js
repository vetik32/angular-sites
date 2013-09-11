describe('Angularjs.org', function () {
  var protractor = require('protractor')
    , tractor = protractor.getInstance()
    , envConfig = require('../server/config/env-config')
    , HOST = envConfig.urls.root
    , request = require('request')
    , protractorConfig = require('../protractorConf.js');

  request.defaults({
    timeout: protractorConfig.config.jasmineNodeOpts.defaultTimeoutInterval
  });

  //Returns a Protractor/WebDriver element promise using CSS query strategy
  var queryDoc = function (query) {
    return tractor.findElement(protractor.By.css(query));
  }


  describe('php', function () {
    it('should not report errors from greet.php', function () {
      request(HOST + '/greet.php', function (err, res, body) {
        expect(body).not.toContain('Undefined index');
      });
    })
  });


  describe('Test Timeout', function () {
    it('should allow 10s before timing out a test', function () {
      setTimeout(function () {
      }, 9900);
    });
  });


  describe('Rewrites', function () {
    it('should execute greet.php', function () {
      request(HOST + '/greet.php?name=jeff&callback=none', function (err, res, body) {
        expect(body).not.toContain("<?");
        expect(body).toContain('none ({"name":"jeff","salutation"');
      });
    });


    it('should rewrite /edit to index.html', function () {
      request(HOST + '/edit', function (err, res, body) {
        expect(body).toContain('AngularJS is what HTML would have been, had it been designed for building web-apps.');
      });
    });

    it('should rewrite /edit/<number> to index.html', function () {
      request(HOST + '/edit/1', function (err, res, body) {
        expect(body).toContain('AngularJS is what HTML would have been, had it been designed for building web-apps.');
      });
    });

    it('should rewrite /list to index.html', function () {
      request(HOST + '/list', function (err, res, body) {
        expect(body).toContain('AngularJS is what HTML would have been, had it been designed for building web-apps.');
      });
    });

    it('should rewrite /new to index.html', function () {
      request(HOST + '/new', function (err, res, body) {
        expect(body).toContain('AngularJS is what HTML would have been, had it been designed for building web-apps.');
      });
    });
  });

  describe('Redirects', function () {
    var htaccess = require('../server/config/angularjs.org.htaccess.json');

    if (htaccess && htaccess.redirects) {
      htaccess.redirects.forEach(function (r) {
        it('should redirect' + r.origin + ' to ' + r.dest, function () {
          request(HOST + r.origin, function (err, res, body) {
            if (err) done(new Error(err));
            expect(res.request.href).toEqual(r.dest);
          });
        });
      });
    }
    else {
      return new Error("Could not load htaccess");
    }

    it('should redirect /api to docs.angularjs.org', function () {
      request(HOST + '/api', function (error, res) {
        if (error) done(new Error(error));
        expect(res.request.href).toEqual('http://docs.angularjs.org/api');
      });
    });

    it('should redirect /docs/api to docs.angularjs.org', function () {
      request(HOST + '/docs/api', function (error, res) {
        if (error) done(new Error(error));
        expect(res.request.href).toEqual('http://docs.angularjs.org/api');
      });
    });
  });

  describe('App', function () {
    tractor.get(HOST);
    it('should load the web page', function () {
      queryDoc('body').getAttribute('ng-controller').then(function (ctrl) {
        expect(ctrl).toEqual('DownloadCtrl');
      });
    });

    describe('Download', function () {
      var stableVersion, cdnInput;

      beforeEach(function () {
        var downloadBtn = queryDoc('.hero-unit .btn-primary'), done;
        downloadBtn.click();
        tractor.driver.sleep(500);
        cdnInput = tractor.findElement(protractor.By.input('cdnURL'));
        cdnInput.getAttribute('value')
        cdnInput.getText().then(function (text) {
          stableVersion = text.toString().split('/').splice(-2,1)[0];
        });
      });

      afterEach(function () {
        queryDoc("#downloadModal .close").click();
        tractor.driver.sleep(500);
      });

      it('should open a modal prompting for download configuration', function () {
        queryDoc('#downloadModal').getCssValue('display').then(function (display) {
          expect(display).toEqual('block');
        });
      });

      it('should change the CDN url based on user selection of stable or unstable', function () {
        var okay;
        var unstableButton = queryDoc("#redPill");
        unstableButton.click();
        cdnInput.getAttribute('value').then(function (val) {
          var unstableVersion = val.split('/').splice(-2,1)[0];
          console.log('versions', unstableVersion, stableVersion);
          for (i = 0; i < unstableVersion.split('.').length; i++) {
            if (unstableVersion.split('.')[i] > stableVersion.split('.')[i]) {
              okay = true;
              break;
            }
          }

          expect(okay).toBe(true);
        });


      });

      it('should allow downloading uncompressed angular', function () {
        var uncompressedBtn = queryDoc('#downloadModal > .modal-body > dl > *:nth-child(4) .btn-group button:nth-child(2)');
        uncompressedBtn.click().then(function () {
          cdnInput.getAttribute('value').then(function (value) {
            expect(value).toContain('angular.js');
            expect(value).not.toContain('.min.js');
          });
        });
      });
    });

    describe('The Basics', function () {
      it('should show the code example', function () {
        queryDoc('#hello-html').getText().then(function (text) {
          expect(text).toContain('{{yourName}}');
        });
      });

      it('should have a hoverable region called ng-app', function () {
        queryDoc('code.nocode').getText().then(function (text) {
          expect(text).toEqual('ng-app');
        });
      });

      it('show a popover when hovering over a highlighted area', function () {
        queryDoc('code.nocode').click().then(function() {
          queryDoc('.popover').getText().then(function (text) {
            expect(text).toEqual('ng-app\nTells AngularJS to be active in this portion of the page. In this case the entire document.');
          });
        });
      });

      it('should update the Hello text after entering a name', function () {
        var el = tractor.findElement(protractor.By.input('yourName'));
        el.click().then(function () {
          el.sendKeys('Jeff').then(function (type) {
            var bound = tractor.findElement(protractor.By.css('.container > *:nth-child(4) h1'));
            bound.getText().then(function (text) {
              expect(text).toEqual('Hello Jeff!');
            });
          });
        });
      });
    });

    describe('Add Some Control', function () {
      it('should strike out a todo when clicked', function () {
        var el = queryDoc('[ng-controller="TodoCtrl"] ul >li:nth-child(2) input');
        el.click();

        var text = queryDoc('[ng-controller="TodoCtrl"] ul >li:nth-child(2) span');
        var cls = text.getAttribute('class');

        expect(cls).toEqual('done-true');
      });

      it('should add a new todo when added through text field', function () {
        var el = tractor.findElement(protractor.By.input('todoText'));
        el.click()
        el.sendKeys('Write tests!')
        var btn = queryDoc('[ng-submit="addTodo()"] .btn-primary');
        btn.click()
        var newItem = queryDoc('[ng-repeat="todo in todos"]:nth-child(3) span');
        expect(newItem.getText()).toEqual('Write tests!');
      });

      it('should show a secondary tab when selected', function () {
        var todoJsTab = queryDoc('[annotate="todo.annotation"] ul.nav-tabs li:nth-child(2) a');
        todoJsTab.click().then(function () {
          var todojs = queryDoc('#todo-js').getCssValue('display').then(function (display) {
            expect(display).toEqual('block');
          });
        });
      });
    });

    describe('Wire up a Backend', function () {
      it('should show a secondary tab when selected', function () {
        var listBtn = queryDoc('[annotate="project.annotation"] ul.nav-tabs li:nth-child(3) a');

        listBtn.click().then(function () {
          var listTab = queryDoc('#list-html');
          listTab.getCssValue('display').then(function (display) {
            expect(display).toEqual('block');
          });
        });
      });

      it('should show a list of JavaScript projects', function () {
        queryDoc('[app-run="project.html"] tr:first-child td a').getText().then(function (text) {
          expect(typeof text).toEqual('string');
        });
      });

      //TODO: Test addition of projects? Didn't include now because I didn't want to spam the list with each test.
    });

    describe('Create Components', function () {
      it('should show the US localization of date', function () {
        var dateText = queryDoc('[module="components-us"] .tab-content > .tab-pane > span:first-child');
        dateText.getText().then(function (text) {
          expect(text).toEqual('Date: Saturday, March 31, 2012');
        });
      });

      it('should show the US pluralization of beer', function () {
        var pluralTabLink = queryDoc('[module="components-us"] .nav-tabs > li:nth-child(2) a');
        pluralTabLink.click().then(function () {
          var pluralTab = queryDoc('[module="components-us"] [ng-controller="BeerCounter"] > div > ng-pluralize');
          pluralTab.getText().then(function (text) {
            expect(text).toEqual('no beers');
          });
        });
      });

      it('should show the Slovak pluralization of beer', function () {
        var pluralTabLink = queryDoc('[module="components-sk"] .nav-tabs > li:nth-child(2) a');
        pluralTabLink.click().then(function () {
          var pluralTab = queryDoc('[module="components-sk"] [ng-controller="BeerCounter"] > div > ng-pluralize');
          pluralTab.getText().then(function (text) {
            expect(text).toEqual('žiadne pivo');
          });
        });
      });
    });

    describe('Embed and Inject', function () {
      it('should have some content under and "Embeddable" heading', function () {
        queryDoc('#embed-and-inject').getText().then(function (text) {
          expect(text).toEqual('Embed and Inject');
        });
      })
    });
  });
});