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
  , HOST = 'http://angularjs.org';

tractor = protractor.wrapDriver(driver);

driver.manage().timeouts().setScriptTimeout(10000);

describe('Angularjs.org', function () {
  describe('Redirects', function () {

  });
  
  describe('Rewrites', function () {

  });

  describe('App', function () {
    tractor.get(HOST);

    it('should load the web page', function (done) {
      tractor.findElement(protractor.By.tagName('body')).getAttribute('ng-controller').then(function (controller) {
        expect(controller).to.equal('DownloadCtrl');
        done();
      });
    });

    describe('The Basics', function () {
      it('should show the code example', function (done) {
        tractor.findElement(protractor.By.id('hello-html')).getText().then(function (text) {
          expect(text).to.contain('{{yourName}}');
          done();
        });
      });

      it('should have a hoverable region called ng-app', function (done) {
        tractor.findElement(protractor.By.css('code.nocode')).getText().then(function (text) {
          expect(text).to.equal('ng-app');
          done();
        });
      });

      it('show a popover when hovering over a highlighted area', function (done) {
        tractor.findElement(protractor.By.css('code.nocode')).click().then(function() {
          tractor.findElement(protractor.By.css('.popover')).getText().then(function (text) {
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
        var el = tractor.findElement(protractor.By.css('[ng-controller="TodoCtrl"] ul >li:nth-child(2) input'));
        el.click().then(function () {
          var text = tractor.findElement(protractor.By.css('[ng-controller="TodoCtrl"] ul >li:nth-child(2) span'))
          .getAttribute('class').then(function (c) {
            expect(c).to.equal('done-true');
            done();
          });
        });
      });

      it('should add a new todo when added through text field', function (done) {
        var el = tractor.findElement(protractor.By.input('todoText'));
        el.click().then(function() {
          el.sendKeys('Write tests!').then(function () {
            var btn = tractor.findElement(protractor.By.css('[ng-submit="addTodo()"] .btn-primary'));
            btn.click().then(function () {
              var newItem = tractor.findElement(protractor.By.css('[ng-repeat="todo in todos"]:nth-child(3) span'));
              newItem.getText().then(function (text) {
                expect(text).to.equal('Write tests!');
                done();
              });
            });
          });
        });
      });
    });

    describe('Wire up a Backend', function () {
      

    });

    describe('Create Components', function () {

    });

    describe('Embed and Inject', function () {
      it('should have some content under and "Embeddable" heading', function (done) {
        tractor.findElement(protractor.By.id('embed-and-inject')).getText().then(function (text) {
          expect(text).to.equal('Embed and Inject');
          done();
        });
      })
    });
  });
});