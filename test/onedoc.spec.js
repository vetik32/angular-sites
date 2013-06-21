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
  , envConfig = require('../server/config/env-config')
  , HOST = envConfig.urls.docs
  , request = require('request')
  , parseXML = require('xml2js').parseString;

var catchPromiseErrors = function(done) {
  webdriver.promise.controlFlow().
    on('uncaughtException', function(e) {
        done(e);
    });
};

 tractor = protractor.wrapDriver(driver);

  driver.manage().timeouts().setScriptTimeout(10000);

  function queryCss (selector) {
    return tractor.findElement(protractor.By.css(selector));
  }

  describe.only('App', function () {
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

    it('should show the functioning input directive example', function (done) {
      tractor.get(HOST + '/api/ng.directive:input');
      // var nameInput = tractor.findElement(protractor.By.input('user.name'));
      var nameInput = queryCss('[ng-model="user.name"]');
      nameInput.click();
      nameInput.sendKeys('!!!');
      var code = queryCss('.doc-example-live tt');
      code.getText().then(function (text) {
        expect(text).to.contain('guest!!!');
        done();
      });
    });
  });
})
