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
    it('should not report errors from greet.php', function (done) {
      request(HOST + '/greet.php', function (err, res, body) {
        expect(body).not.toContain('Undefined index');
        done();
      });
    })
  });


  describe('Test Timeout', function () {
    it('should allow 10s before timing out a test', function (done) {
      setTimeout(function () {
        done();
      }, 9900);
    });
  });


  describe('Rewrites', function () {
    it('should execute greet.php', function (done) {
      request(HOST + '/greet.php?name=jeff&callback=none', function (err, res, body) {
        expect(body).not.toContain("<?");
        expect(body).toContain('none ({"name":"jeff","salutation"');
        done();
      });
    });


    it('should rewrite /edit to index.html', function (done) {
      request(HOST + '/edit', function (err, res, body) {
        expect(body).toContain('AngularJS is what HTML would have been, had it been designed for building web-apps.');
        done();
      });
    });

    it('should rewrite /edit/<number> to index.html', function (done) {
      request(HOST + '/edit/1', function (err, res, body) {
        expect(body).toContain('AngularJS is what HTML would have been, had it been designed for building web-apps.');
        done();
      });
    });

    it('should rewrite /list to index.html', function (done) {
      request(HOST + '/list', function (err, res, body) {
        expect(body).toContain('AngularJS is what HTML would have been, had it been designed for building web-apps.');
        done();
      });
    });

    it('should rewrite /new to index.html', function (done) {
      request(HOST + '/new', function (err, res, body) {
        expect(body).toContain('AngularJS is what HTML would have been, had it been designed for building web-apps.');
        done();
      });
    });
  });

  describe('Redirects', function () {
    var htaccess = require('../server/config/angularjs.org.htaccess.json');

    if (htaccess && htaccess.redirects) {
      htaccess.redirects.forEach(function (r) {
        it('should redirect' + r.origin + ' to ' + r.dest, function (done) {
          request(HOST + r.origin, function (err, res, body) {
            if (err) done(new Error(err));
            expect(res.request.href).toEqual(r.dest);
            done();
          });
        });
      });
    }
    else {
      return new Error("Could not load htaccess");
    }

    it('should redirect /api to docs.angularjs.org', function (done) {
      request(HOST + '/api', function (error, res) {
        if (error) done(new Error(error));
        expect(res.request.href).toEqual('http://docs.angularjs.org/api');
        done();
      });
    });

    it('should redirect /docs/api to docs.angularjs.org', function (done) {
      request(HOST + '/docs/api', function (error, res) {
        if (error) done(new Error(error));
        expect(res.request.href).toEqual('http://docs.angularjs.org/api');
        done();
      });
    });
  });

  describe('App', function () {
    tractor.get(HOST);
    it('should load the web page', function (done) {
      queryDoc('body').getAttribute('ng-controller').then(function (ctrl) {
        expect(ctrl).toEqual('DownloadCtrl');
        done();
      });
    });

    describe('Download', function () {
      var stableVersion, cdnInput;

      beforeEach(function (done) {
        var downloadBtn = queryDoc('.hero-unit .btn-primary'), done;
        downloadBtn.click().then(function () {
          setTimeout(function () {
            cdnInput = tractor.findElement(protractor.By.input('cdnURL'));
            cdnInput.getAttribute('value').then(function (text) {
              stableVersion = text.split('/').splice(-2,1)[0];
              done();
            });
          }, 500);
        });
      }, 5000);

      afterEach(function (done) {
        queryDoc("#downloadModal .close").click();
        setTimeout(function () {
          done();
        }, 500);
      });

      it('should open a modal prompting for download configuration', function (done) {
        queryDoc('#downloadModal').getCssValue('display').then(function (display) {
          expect(display).toEqual('block');
          done();
        });
      });

      it('should change the CDN url based on user selection of stable or unstable', function (done) {
        var unstableButton = queryDoc("#redPill");
        unstableButton.click().then(function () {

          cdnInput.getAttribute('value').then(function (text) {
            unstableVersion = text.split('/').splice(-2,1)[0];

            for (i = 0; i < unstableVersion.split('.').length; i++) {
              if (unstableVersion.split('.')[i] > stableVersion.split('.')[i]) {
                okay = true;
                break;
              }
            }

            expect(okay).toBe(true);
            done();
          });
        });
      });

      it('should allow downloading uncompressed angular', function (done) {
        var uncompressedBtn = queryDoc('#downloadModal > .modal-body > dl > *:nth-child(4) .btn-group button:nth-child(2)');
        uncompressedBtn.click().then(function () {
          cdnInput.getAttribute('value').then(function (value) {
            expect(value).toContain('angular.js');
            expect(value).not.toContain('.min.js');
            done();
          });
        });
      });
    });

    describe('The Basics', function () {
      it('should show the code example', function (done) {
        queryDoc('#hello-html').getText().then(function (text) {
          expect(text).toContain('{{yourName}}');
          done();
        });
      });

      it('should have a hoverable region called ng-app', function (done) {
        queryDoc('code.nocode').getText().then(function (text) {
          expect(text).toEqual('ng-app');
          done();
        });
      });

      it('show a popover when hovering over a highlighted area', function (done) {
        queryDoc('code.nocode').click().then(function() {
          queryDoc('.popover').getText().then(function (text) {
            expect(text).toEqual('ng-app\nTells AngularJS to be active in this portion of the page. In this case the entire document.');
            done();
          });
        });
      });

      it('should update the Hello text after entering a name', function (done) {
        var el = tractor.findElement(protractor.By.input('yourName'));
        el.click().then(function () {
          el.sendKeys('Jeff').then(function (type) {
            var bound = tractor.findElement(protractor.By.css('.container > *:nth-child(4) h1'));
            bound.getText().then(function (text) {
              expect(text).toEqual('Hello Jeff!');
              done();
            });
          });
        });
      });
    });

    describe('Add Some Control', function () {
      it('should strike out a todo when clicked', function (done) {
        var el = queryDoc('[ng-controller="TodoCtrl"] ul >li:nth-child(2) input');
        el.click().then(function () {
          var text = queryDoc('[ng-controller="TodoCtrl"] ul >li:nth-child(2) span');
          text.getAttribute('class').then(function (cls) {
            expect(cls).toEqual('done-true');
            done();
          });
        });
      });

      it('should add a new todo when added through text field', function (done) {
        var el = tractor.findElement(protractor.By.input('todoText'));
        el.click().then(function() {
          el.sendKeys('Write tests!').then(function () {
            var btn = queryDoc('[ng-submit="addTodo()"] .btn-primary');
            btn.click().then(function () {
              var newItem = queryDoc('[ng-repeat="todo in todos"]:nth-child(3) span');
              newItem.getText().then(function (text) {
                expect(text).toEqual('Write tests!');
                done();
              });
            });
          });
        });
      });

      it('should show a secondary tab when selected', function (done) {
        var todoJsTab = queryDoc('[annotate="todo.annotation"] ul.nav-tabs li:nth-child(2) a');
        todoJsTab.click().then(function () {
          var todojs = queryDoc('#todo-js').getCssValue('display').then(function (display) {
            expect(display).toEqual('block');
            done();
          });
        });
      });
    });

    describe('Wire up a Backend', function () {
      it('should show a secondary tab when selected', function (done) {
        var listBtn = queryDoc('[annotate="project.annotation"] ul.nav-tabs li:nth-child(3) a');

        listBtn.click().then(function () {
          var listTab = queryDoc('#list-html');
          listTab.getCssValue('display').then(function (display) {
            expect(display).toEqual('block');
            done();
          });
        });
      });

      it('should show a list of JavaScript projects', function (done) {
        queryDoc('[app-run="project.html"] tr:first-child td a').getText().then(function (text) {
          expect(typeof text).toEqual('string');
          done();
        });
      });

      //TODO: Test addition of projects? Didn't include now because I didn't want to spam the list with each test.
    });

    describe('Create Components', function () {
      it('should show the US localization of date', function (done) {
        var dateText = queryDoc('[module="components-us"] .tab-content > .tab-pane > span:first-child');
        dateText.getText().then(function (text) {
          expect(text).toEqual('Date: Saturday, March 31, 2012');
          done();
        });
      });

      it('should show the US pluralization of beer', function (done) {
        var pluralTabLink = queryDoc('[module="components-us"] .nav-tabs > li:nth-child(2) a');
        pluralTabLink.click().then(function () {
          var pluralTab = queryDoc('[module="components-us"] [ng-controller="BeerCounter"] > div > ng-pluralize');
          pluralTab.getText().then(function (text) {
            expect(text).toEqual('no beers');
            done();
          });
        });
      });

      it('should show the Slovak pluralization of beer', function (done) {
        var pluralTabLink = queryDoc('[module="components-sk"] .nav-tabs > li:nth-child(2) a');
        pluralTabLink.click().then(function () {
          var pluralTab = queryDoc('[module="components-sk"] [ng-controller="BeerCounter"] > div > ng-pluralize');
          pluralTab.getText().then(function (text) {
            expect(text).toEqual('žiadne pivo');
            done();
          });
        });
      });
    });

    describe('Embed and Inject', function () {
      it('should have some content under and "Embeddable" heading', function (done) {
        queryDoc('#embed-and-inject').getText().then(function (text) {
          expect(text).toEqual('Embed and Inject');
          done();
        });
      })
    });
  });
});