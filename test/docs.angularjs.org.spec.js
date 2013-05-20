describe('docs.angularjs.org', function () {
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
  , envConfig = require('../env-config')
  , HOST = envConfig.urls.docs
  , request = require('request')
  , parseXML = require('xml2js').parseString;

  tractor = protractor.wrapDriver(driver);

  driver.manage().timeouts().setScriptTimeout(10000);

  function queryCss (selector) {
    return tractor.findElement(protractor.By.css(selector));
  }

  describe('Pushstate', function () {
    it('should rewrite /guide to index.html', function (done) {
      tractor.get(HOST + '/guide');
      var introParagraph = queryCss('.content p');
      introParagraph.getText().then(function (text) {
        expect(text).to.contain('Welcome to the angular Developer Guide.');
        done();
      });
    });

    it('should rewrite /guide/directive to index.html', function (done) {
      tractor.get(HOST + '/guide/directive');
      var introParagraph = queryCss('.content p');
      introParagraph.getText().then(function (text) {
        expect(text).to.contain('Directives are a way to teach HTML new tricks.');
        done();
      });
      
    });

    it('should rewrite /api to index.html', function (done) {
      tractor.get(HOST + '/api');
      var introParagraph = queryCss('.content p');
      introParagraph.getText().then(function (text) {
        expect(text).to.contain('Use the API Reference documentation');
        done();
      });
    });

    it('should rewrite /api/ng.directive:ngApp to index.html', function (done) {
      tractor.get(HOST + '/api/ng.directive:ngApp');
      var introParagraph = queryCss('.content p');
      introParagraph.getText().then(function (text) {
        expect(text).to.contain('Use this directive to auto-bootstrap an application.');
        done();
      });
    });

    it('should rewrite /cookbook to index.html', function (done) {
      tractor.get(HOST + '/cookbook');
      var introParagraph = queryCss('.content p');
      introParagraph.getText().then(function (text) {
        expect(text).to.contain('Welcome to the Angular cookbook');
        done();
      });
    });

    it('should rewrite /cookbook/form to index.html', function (done) {
      tractor.get(HOST + '/cookbook/form');
      var introParagraph = queryCss('.content p');
      introParagraph.getText().then(function (text) {
        expect(text).to.contain('For this reason Angular strives to make both of these operations trivial.');
        done();
      });
    });

    it('should rewrite /misc/contribute to index.html', function (done) {
      tractor.get(HOST + '/misc/contribute');
      var introParagraph = queryCss('.content');
      introParagraph.getText().then(function (text) {
        expect(text).to.contain('AngularJS is an open source project licensed under the');
        done();
      });
    });

    it('should rewrite /tutorial to index.html', function (done) {
      tractor.get(HOST + '/tutorial');
      var introParagraph = queryCss('.content p');
      introParagraph.getText().then(function (text) {
        expect(text).to.contain('A great way to get introduced to AngularJS is to work through this tutorial');
        done();
      });
    });

    it('should rewrite /tutorial/step_01 to index.html', function (done) {
      tractor.get(HOST + '/tutorial/step_01');
      var introParagraph = queryCss('.content p');
      introParagraph.getText().then(function (text) {
        expect(text).to.contain('In order to illustrate how Angular enhances standard HTML');
        done();
      });
    });
  });

  describe('Crawlability', function () {
    //TODO: Implement tests
  });

  describe('App', function () {
    before(function (done) {
      tractor.get(HOST);
      done();
    });

    after(function (done) {
      driver.quit().then(function () {
        done();
      });
    });
    
    var search
      , firstModule;

    it('should filter the module list when searching', function (done) {
      search = tractor.findElement(protractor.By.input('search'));
      
      search.sendKeys('ngBind').then(function () {
        firstModule = queryCss('[ng-repeat="page in module.directives"] a');
        firstModule.getText().then(function (text) {
          expect(text).to.equal('ngBind');
          done();
        });
      });
    });

    it('should change the page content when clicking a module from the left', function (done) {
      firstModule.click().then(function () {
        //Wait for content to load
        setTimeout(function (){
          var pageBody = queryCss('.content h1 code');
          pageBody.getText().then(function (text) {
            expect(text).to.equal('ngBind');
            done();
          });
        }, 500);
        
      });
    });

    it('should load the Disqus comments', function (done) {
      var disqusFrame = queryCss('#disqus iframe');
      disqusFrame.getSize().then(function (size) {  
        expect(size.height).to.be.greaterThan(10);
        done();
      });
    });

    it('should show the functioning input directive example', function (done) {
      tractor.get(HOST + '/api/ng.directive:input');
      var nameInput = queryCss('[ng-model="user.name"]');
      nameInput.click();
      nameInput.sendKeys('!!!');
      var code = queryCss('.doc-example-live tt');
      code.getText().then(function (text) {
        expect(text).to.contain('guest!!!');
        done();
      });
    });

    it('should show the functioning radio directive example', function (done) {
      tractor.get(HOST + '/api/ng.directive:input.radio');
      var redBtn = queryCss('form[name="myForm"] input[value="red"]');
      redBtn.click();
      var liveCode = queryCss('.doc-example-live tt');
      liveCode.getText().then(function (text) {
        expect(text).to.contain('color = red');
        done();
      });
    });
  });
})