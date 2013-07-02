describe('builtwith.angularjs.org', function () {
  var request = require('request')
  , envConfig = require('../server/config/env-config')
  , HOST = envConfig.urls.builtwith
  , protractor = require('protractor')
  , tractor = protractor.getInstance();

  var _beforeAll;
  beforeEach(function () {
    if (_beforeAll) return;
    _beforeAll = true;

    tractor.get(HOST);
  });

  describe('Rewrite', function () {
    it('should rewrite /project/X to index.html', function (done) {
      request(HOST + '/project/YouTube-on-PS3', function (err, res, body) {
        expect(body).toContain('Built with AngularJS');
        expect(body).toContain('Super-powered by Google');
        done();
      });
    });
  });

  describe('App', function () {
    describe('Homepage', function () {
      it('should attach a scope to <body>', function (done) {
        var body = tractor.findElement(protractor.By.css('body.ng-scope'));
        expect(body).toBeTruthy();
        done();
      });

      it('should allow searching of projects', function (done) {
        var search = tractor.findElement(protractor.By.input('query'));
        search.click().then(function () {
          search.sendKeys('YouTube on PS3').then(function () {
            var result1 = tractor.findElement(protractor.By.css('bwa-project > div > h2'));
            result1.getText().then(function (text) {
              expect(text).toEqual('YouTube on PS3');
              search.clear();
              done();
            });
          });
        })
      });

      it('should have a navbar with links in it', function (done) {
        var homeBtn = tractor.findElement(protractor.By.css('.navbar .nav>li.active > a'));
        homeBtn.getAttribute('href').then(function (href) {
          expect(href).toEqual('http://angularjs.org/');
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
          expect(src).toBeTruthy();

          heroHeading.getText().then(function (text) {
            expect(text).toBeTruthy();

            heroDesc.getText().then(function (text) {
              expect(text).toBeTruthy();

              heroTag.getText().then(function (text) {
                expect(text).toBeTruthy();
                done();
              })
            })
          })
        });
      });

      it('should show a lightbox when clicking a project link', function (done) {
        var projectLink = tractor.findElement(protractor.By.css('[project="featured"] > div[ng-click]'));
        projectLink.click().then(function () {
          var lightbox = tractor.findElement(protractor.By.css('.modal'));
          lightbox.getCssValue('display').then(function (display) {
            expect(display).toEqual('block');
            done();
          });
        });
      });

      it('should show a count of all projects greater than 0', function (done) {
        var count = tractor.findElement(protractor.By.css('.bwa-count'));
        count.getText().then(function (text) {
          expect(parseInt(text, 10)).toBeGreaterThan(0);
          done();
        });
      });

      it('should sort projects alphabetically by name when name sort is selected', function (done) {
        tractor.get(HOST);
        var option
          , names = []
          , prev
          , ordered = true
          , completed = 0;

        option = tractor.findElement(protractor.By.css('[ng-model="sortPrep"] option[value="1"]'));
        option.click().then(function () {
          //Check order of first four items.
          tractor.findElements(protractor.By.css('[ng-repeat="project in projectCol"] h2')).then(function (headings) {
            headings.forEach(function (element, i) {
              element.getText().then(function (text) {
                if (typeof prev !== 'undefined' && text[0].toLowerCase() < prev) {
                  ordered = false;
                }

                prev = text[0].toLowerCase();
                completed++;

                if (completed === headings.length) {
                  expect(ordered).toBe(true);
                  done();
                }
              });
            });
          });
        });
      });
    });
  });
});