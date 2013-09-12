describe('builtwith.angularjs.org', function () {
  var request = require('request')
  , envConfig = require('../server/config/env-config')
  , HOST = envConfig.urls.builtwith
  , protractor = require('protractor')
  , tractor = protractor.getInstance()
  , protractorConfig = require('../protractorConf.js');

  request.defaults({
    timeout: protractorConfig.config.jasmineNodeOpts.defaultTimeoutInterval
  });

  var _beforeAll;
  beforeEach(function () {
    if (_beforeAll) return;
    _beforeAll = true;

    tractor.get(HOST);
  });


  describe('Rewrite', function () {
    it('should rewrite /project/X to index.html', function () {
      request(HOST + '/project/YouTube-on-PS3', function (err, res, body) {
        expect(body).toContain('Built with AngularJS');
        expect(body).toContain('Super-powered by Google');
      });
    });
  });


  describe('App', function () {
    describe('Homepage', function () {
      it('should attach a scope to <body>', function () {
        var body = tractor.findElement(protractor.By.css('body.ng-scope'));
        expect(body.getAttribute('class')).toContain('ng-scope');
      });


      it('should allow searching of projects', function () {
        var search = tractor.findElement(protractor.By.input('query'));
        search.click()
        search.sendKeys('YouTube on PS3')

        var result1 = tractor.findElement(protractor.By.css('bwa-project > div > h2'));

        expect(result1.getText()).toEqual('YouTube on PS3');
        search.clear();
      });


      it('should have a navbar with links in it', function () {
        var homeBtn = tractor.findElement(protractor.By.css('.navbar .nav>li.active > a'));
        expect(homeBtn.getAttribute('href')).toEqual('http://angularjs.org/');
      });


      it('should have proper fields for the featured project', function () {
        var parentCSS = '[project="featured"]'
        var heroImg = tractor.findElement(protractor.By.css(parentCSS + ' .bwa-img'));
        var heroHeading = tractor.findElement(protractor.By.css(parentCSS + ' h2'));
        var heroDesc = tractor.findElement(protractor.By.css(parentCSS + ' .bwa-project-desc'));
        var heroTag = tractor.findElement(protractor.By.css(parentCSS + ' .label'));

        expect(heroImg.getAttribute('src')).toBeTruthy();
        expect(heroHeading.getText()).toBeTruthy();
        expect(heroDesc.getText()).toBeTruthy();
        expect(heroTag.getText()).toBeTruthy();
      });


      it('should show a lightbox when clicking a project link', function () {
        var projectLink = tractor.findElement(protractor.By.css('[project="featured"] > div[ng-click]'));
        projectLink.click()

        var lightbox = tractor.findElement(protractor.By.css('.modal'));
        expect(lightbox.getCssValue('display')).toEqual('block');
      });


      it('should show a count of all projects greater than 0', function () {
        var count = tractor.findElement(protractor.By.css('.bwa-count'));
        count.getText().then(function (num) {
          expect(parseInt(num, 10)).toBeGreaterThan(0);
        });
      });


      it('should sort projects alphabetically by name when name sort is selected', function () {
        var option
          , names = []
          , prev
          , ordered = true
          , completed = 0;

        option = tractor.findElement(protractor.By.css('[ng-model="sortPrep"] option[value="1"]'));
        option.click();

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
              }
            });
          });
        });
      });
    });
  });
});