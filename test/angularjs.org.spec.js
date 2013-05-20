describe('Angularjs.org', function () {
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
    , HOST = envConfig.urls.root
    , request = require('request');

  tractor = protractor.wrapDriver(driver);

  driver.manage().timeouts().setScriptTimeout(10000);

  //Returns a Protractor/WebDriver element promise using CSS query strategy
  var queryDoc = function (query) {
    return tractor.findElement(protractor.By.css(query));
  }

  after(function (done) {
    driver.quit().then(function(){
      done();
    });
  });

  describe('Redirects', function () {
    htaccess = require('../server/config/angularjs.org.htaccess.json');
    if (htaccess && htaccess.redirects) {
      htaccess.redirects.forEach(function (r) {
        it('should redirect' + r.origin + ' to ' + r.dest, function (done) {
          request(HOST + r.origin, function (error, res) {
            if (error) done(new Error(error));
            expect(res.request.href).to.equal(r.dest);
            done();
          });
        });
      });
    }
    else {
      return new Error("Could not load htaccess");
    }
  });
  
  describe('Rewrites', function () {

  });

  describe('App', function () {
    tractor.get(HOST);
    it('should load the web page', function (done) {
      queryDoc('body').getAttribute('ng-controller').then(function (controller) {
        expect(controller).to.equal('DownloadCtrl');
        done();
      });
    });

    describe('Download', function () {
      var downloadBtn = queryDoc('.hero-unit .btn-primary');
      var downloadModal;
      var cdnInput;
      var stableVersion;

      before(function (done) {
        downloadBtn.click().then(function () {
          //Wait for modal to fade in
          setTimeout(function () {
            cdnInput = tractor.findElement(protractor.By.input('cdnURL'));
            cdnInput.getAttribute('value').then(function (text) {
              stableVersion = text.split('/').splice(-2,1)[0];
              done();
            });
          }, 500);
          
        });
      });

      after(function (done) {
        var closeBtn = queryDoc("#downloadModal .close");
        closeBtn.click().then(function () {
          setTimeout(function () {
            done();
          }, 500);
        })
      });

      it('should open a modal prompting for download configuration', function (done) {        
        downloadModal = queryDoc('#downloadModal');
        downloadModal.getCssValue('display').then(function (display) {
          expect(display).to.equal('block');
          done();
        });
      });

      it('should change the CDN url based on user selection of stable or unstable', function (done) {
        var unstableButton = queryDoc("#redPill");
        unstableButton.click().then(function () {
          cdnInput.getAttribute('value').then(function (text) {
            var unstableVersion = text.split('/').splice(-2,1)[0];
            var okay = false;
            
            for (i = 0; i < unstableVersion.split('.').length; i++) {
              if (unstableVersion.split('.')[i] > stableVersion.split('.')[i]) {
                okay = true;
                break;
              }
            }

            expect(okay).to.be.ok();
            done();
          })
        });
      });

      it('should allow downloading uncompressed angular', function (done) {
        var uncompressedBtn = queryDoc('#downloadModal > .modal-body > dl > *:nth-child(4) .btn-group button:nth-child(2)');

        uncompressedBtn.click().then(function () {
          cdnInput.getAttribute('value').then(function (value) {
            expect(value).to.contain('angular.js');
            expect(value).not.to.contain('.min.js');
            done();
          });
        });
      });
    });

    describe('The Basics', function () {
      it('should show the code example', function (done) {
        queryDoc('#hello-html').getText().then(function (text) {
          expect(text).to.contain('{{yourName}}');
          done();
        });
      });

      it('should have a hoverable region called ng-app', function (done) {
        queryDoc('code.nocode').getText().then(function (text) {
          expect(text).to.equal('ng-app');
          done();
        });
      });

      it('show a popover when hovering over a highlighted area', function (done) {
        queryDoc('code.nocode').click().then(function() {
          queryDoc('.popover').getText().then(function (text) {
            expect(text).to.equal('ng-app\nTells AngularJS to be active in this portion of the page. In this case the entire document.');
            done()
          });
        });
      });

      it('should update the Hello text after entering a name', function (done) {
        var el = tractor.findElement(protractor.By.input('yourName'));
        el.click().then(function () {
          el.sendKeys('Jeff').then(function (type) {
            var bound = tractor.findElement(protractor.By.css('.container > *:nth-child(4) h1'));
            bound.getText().then(function (text) {
              expect(text).to.equal('Hello Jeff!');
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
          text.getAttribute('class').then(function (c) {
            expect(c).to.equal('done-true');
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
                expect(text).to.equal('Write tests!');
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
            expect(display).to.equal('block');
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
            expect(display).to.equal('block');
            done();
          });
        });
      });

      it('should show a list of JavaScript projects', function (done) {
        var firstLi = queryDoc('[app-run="project.html"] tr:first-child td a');
        firstLi.getText().then(function (text) {
          expect(text).to.be.ok();
          done();
        });
      });

      //TODO: Test addition of projects? Didn't include now because I didn't want to spam the list with each test. 

    });

    describe('Create Components', function () {
      it('should show the US localization of date', function (done) {
        var dateText = queryDoc('[module="components-us"] .tab-content > .tab-pane > span:first-child');
        dateText.getText().then(function (text) {
          expect(text).to.equal('Date: Saturday, March 31, 2012');
          done();
        });
      });

      it('should show the US pluralization of beer', function (done) {
        var pluralTabLink = queryDoc('[module="components-us"] .nav-tabs > li:nth-child(2) a');
        pluralTabLink.click().then(function () {
          var pluralTab = queryDoc('[module="components-us"] [ng-controller="BeerCounter"] > div > ng-pluralize');
          pluralTab.getText().then(function (text) {
            expect(text).to.equal('no beers');
            done();
          });
        });
      });

      it('should show the Slovak pluralization of beer', function (done) {
        var pluralTabLink = queryDoc('[module="components-sk"] .nav-tabs > li:nth-child(2) a');
        pluralTabLink.click().then(function () {
          var pluralTab = queryDoc('[module="components-sk"] [ng-controller="BeerCounter"] > div > ng-pluralize');
          pluralTab.getText().then(function (text) {
            expect(text).to.equal('žiadne pivo');
            done();
          });
        });
      });
    });

    describe('Embed and Inject', function () {
      it('should have some content under and "Embeddable" heading', function (done) {
        queryDoc('#embed-and-inject').getText().then(function (text) {
          expect(text).to.equal('Embed and Inject');
          done();
        });
      })
    });
  });
});