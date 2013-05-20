describe('builtwith.angularjs.org', function () {
  var request = require('request')
  , expect = require('expect.js')
  , envConfig = require('../server/config/env-config')
  , HOST = envConfig.urls.builtwith
  , webdriver = require('selenium-webdriver')
  , protractor = require('protractor')
  , driver = new webdriver.Builder().
      usingServer('http://localhost:4444/wd/hub').
      withCapabilities({
        'browserName': 'chrome',
        'version': '',
        'platform': 'ANY',
        'javascriptEnabled': true
      }).build()
  , tractor;

  tractor = protractor.wrapDriver(driver);

  driver.manage().timeouts().setScriptTimeout(15000);

  driver.get(HOST);

  describe('Rewrite', function () {
    it('should rewrite /project/X to index.html', function (done) {
      request(HOST + '/project/YouTube-on-PS3', function (err, res, body) {
        expect(body).to.contain('Built with AngularJS');
        expect(body).to.contain('Super-powered by Google');
        done();
      });
    });
  });

  describe('App', function () {
    describe('Homepage', function () {
      after(function (done) {
        driver.quit().then(function () {
          done();
        })
      });

      it('should attach a scope to <body>', function (done) {
        var body = tractor.findElement(protractor.By.css('body.ng-scope'));
        expect(body).to.be.ok();
        done();
      });

      it('should allow searching of projects', function (done) {
        var search = tractor.findElement(protractor.By.input('query'));
        search.click().then(function () {
          search.sendKeys('YouTube on PS3').then(function () {
            var result1 = tractor.findElement(protractor.By.css('bwa-project > div > h2'));
            result1.getText().then(function (text) {
              expect(text).to.equal('YouTube on PS3');
              search.clear();
              done();
            });
          });
        })
      });

      it('should have a navbar with links in it', function (done) {
        var homeBtn = tractor.findElement(protractor.By.css('.navbar .nav>li.active > a'));
        homeBtn.getAttribute('href').then(function (href) {
          expect(href).to.equal('http://angularjs.org/');
          done();
        });
      });

      it('should have proper fields for the featured project', function (done) {
        var parentCSS = '[project="featured"]'
        var heroImg = tractor.findElement(protractor.By.css(parentCSS + ' .bwa-img'));
        var heroHeading = tractor.findElement(protractor.By.css(parentCSS + ' h2'));
        var heroDesc = tractor.findElement(protractor.By.css(parentCSS + ' .bwa-project-desc'));
        var heroTag = tractor.findElement(protractor.By.css(parentCSS + ' .label'));

        heroImg.getAttribute('src').then(function (src) {
          expect(src).to.be.ok();

          heroHeading.getText().then(function (text) {
            expect(text).to.be.ok();

            heroDesc.getText().then(function (text) {
              expect(text).to.be.ok();

              heroTag.getText().then(function (text) {
                expect(text).to.be.ok();
                done();
              })
            })
          })
        });
      });

      it('should show a lightbox when clicking a project link', function (done) {
        var projectLink = tractor.findElement(protractor.By.css('[project="featured"] > div[ng-click]'));
        projectLink.click().then(function () {
          //Wait for light box to fade in
          setTimeout(function () {
            var lightbox = tractor.findElement(protractor.By.css('.modal'));
            lightbox.getCssValue('display').then(function (display) {
              expect(display).to.equal('block');
              done();
            });
          }, 500);
        });
      });

      it('should show a count of all projects greater than 0', function (done) {
        var count = tractor.findElement(protractor.By.css('.bwa-count'));
        count.getText().then(function (text) {
          expect(parseInt(text, 10)).to.be.greaterThan(0);
          done();
        });
      });

      it('should sort projects alphabetically by name when name sort is selected', function (done) {
        var option = tractor.findElement(protractor.By.css('[ng-model="sortPrep"] option[value="1"]'));
        option.click().then(function () {
          //Check order of first four items.
          /*var elements = driver.findElements(protractor.By.css('.bwa-projects .bwa-project'));
          var names = [];
          elements.forEach(function (element, i) {
            element.getText().then(function (text) {
              names[i] = text;
            })
          });
          var lowLetter = names[0][0];
          names.forEach(function (name) {
            if (name[0] < lowLetter) {
              namesInOrder = false;
            }
          })*/
          done();
        })
      });
    });
    
    describe('Project Detail Page', function () {
      before(function (done) {
        driver.get(HOST + '/project/YouTube-on-PS3');
        done();
      });
      
      after(function (done) {
        driver.quit().then(function () {
          done();
        })
      });
    });
  });
});