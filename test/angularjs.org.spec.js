describe('Angularjs.org', function () {
  var protractor = require('protractor')
    , tractor = protractor.getInstance()
    , envConfig = require('../server/config/env-config')
    , HOST = envConfig.urls.root
    , request = require('request')
    , protractorConfig = require('../protractorConf.js')
    , webdriver = require('selenium-webdriver');

  request.defaults({
    timeout: protractorConfig.config.jasmineNodeOpts.defaultTimeoutInterval
  });


  describe('php', function () {
    it('should not report errors from greet.php', function () {
      request(HOST + '/greet.php', function (err, res, body) {
        expect(body.indexOf('Undefined index')).toBe(-1);
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
        expect(body.indexOf('<?')).toBe(-1);
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
    beforeEach(function () {
      tractor.get(HOST);
    });


    it('should load the web page', function () {
      var body = tractor.findElement(protractor.By.css('body'));
      expect(body.getAttribute('ng-controller')).toEqual('DownloadCtrl');
    });


    describe('Download', function () {
      var stableVersion, cdnInput;

      beforeEach(function () {
        var downloadBtn = tractor.findElement(protractor.By.css('.hero-unit .btn-primary')), done;
        downloadBtn.click();
        tractor.driver.sleep(500);
        cdnInput = tractor.findElement(protractor.By.input('cdnURL'));
        cdnInput.getAttribute('value')
        cdnInput.getText().then(function (text) {
          stableVersion = text.toString().split('/').splice(-2,1)[0];
        });
      });

      afterEach(function () {
        tractor.findElement(protractor.By.css("#downloadModal .close")).click();
        tractor.driver.sleep(500);
      });


      it('should open a modal prompting for download configuration', function () {
        var downloadModal = tractor.findElement(protractor.By.css('#downloadModal'))
        expect(downloadModal.getCssValue('display')).toEqual('block');
      });


      it('should change the CDN url based on user selection of stable or unstable', function () {
        var okay;
        var unstableButton = tractor.findElement(protractor.By.css("#redPill"));
        unstableButton.click();
        cdnInput.getAttribute('value').then(function (val) {
          var unstableVersion = val.split('/').splice(-2,1)[0];
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
        var uncompressedBtn = tractor.findElement(protractor.By.css('#downloadModal > .modal-body > dl > *:nth-child(4) .btn-group button:nth-child(2)'));
        uncompressedBtn.click()

        expect(cdnInput.getAttribute('value')).toContain('angular.js');
      });
    });

    describe('The Basics', function () {
      it('should show the code example', function () {
        var hello = tractor.findElement(protractor.By.css('#hello-html'))
        expect(hello.getText()).toContain('{{yourName}}');
      });


      it('should have a hoverable region called ng-app', function () {
        var noCode = tractor.findElement(protractor.By.css('code.nocode'))
        expect(noCode.getText()).toEqual('ng-app');
      });


      it('show a popover when hovering over a highlighted area', function () {
        var noCode = tractor.findElement(protractor.By.css('code.nocode'))
        noCode.click()

        var popover = tractor.findElement(protractor.By.css('.popover'))
        expect(popover.getText()).toEqual('ng-app\nTells AngularJS to be active in this portion of the page. In this case the entire document.');
      });


      it('should update the Hello text after entering a name', function () {
        var el = tractor.findElement(protractor.By.input('yourName'));
        el.click()
        el.sendKeys('Jeff')

        var bound = tractor.findElement(protractor.By.css('.container > *:nth-child(4) h1'));
        expect(bound.getText()).toEqual('Hello Jeff!');
      });
    });


    describe('Add Some Control', function () {
      it('should strike out a todo when clicked', function () {
        var el = tractor.findElement(protractor.By.css('[ng-controller="TodoCtrl"] ul >li:nth-child(2) input'));
        el.click();
        expect(el.getAttribute('value')).toBe('on');
      });


      it('should add a new todo when added through text field', function () {
        var el = tractor.findElement(protractor.By.input('todoText'));
        el.click();
        el.sendKeys('Write tests!');
        el.sendKeys(webdriver.Key.RETURN);

        var lastTodo = tractor.findElement(protractor.By.css('[ng-repeat="todo in todos"]:nth-child(3) span'));
        expect(lastTodo.getText()).toEqual('Write tests!');
      });


      it('should show a secondary tab when selected', function () {
        var todoJsTab = tractor.findElement(protractor.By.css('[annotate="todo.annotation"] ul.nav-tabs li:nth-child(2) a'));
        todoJsTab.click()

        var todojs = tractor.findElement(protractor.By.css('#todo-js'));
        expect(todojs.getCssValue('display')).toEqual('block');
      });
    });


    describe('Wire up a Backend', function () {
      it('should show a secondary tab when selected', function () {
        var listBtn = tractor.findElement(protractor.By.css('[annotate="project.annotation"] ul.nav-tabs li:nth-child(3) a'));
        listBtn.click();

        var listTab = tractor.findElement(protractor.By.css('#list-html'));
        expect(listTab.getCssValue('display')).toEqual('block');
      });
    });


    describe('Create Components', function () {
      it('should show the US localization of date', function () {
        var dateText = tractor.findElement(protractor.By.css('[module="components-us"] .tab-content > .tab-pane > span:first-child'));
        var text = dateText.getText();

        expect(text).toMatch(/^Date: [A-Za-z]*, [A-Za-z]+ [0-9]{1,2}, [0-9]{4}$/);
      });


      /*it('should show the US pluralization of beer', function () {
        var pluralTabLink = tractor.findElement(protractor.By.css('[module="components-us"] .nav-tabs > li:nth-child(2) a'));
        pluralTabLink.click()

        var pluralTab = tractor.findElement(protractor.By.css('[module="components-us"] [ng-controller="BeerCounter"] > div > ng-pluralize'));
        expect(pluralTab.getText()).toEqual('no beers');
      });


      it('should show the Slovak pluralization of beer', function () {
        var pluralTabLink = tractor.findElement(protractor.By.css('[module="components-sk"] .nav-tabs > li:nth-child(2) a'));
        pluralTabLink.click();

        var pluralTab = tractor.findElement(protractor.By.css('[module="components-sk"] [ng-controller="BeerCounter"] > div > ng-pluralize'));
        expect(pluralTab.getText()).toEqual('žiadne pivo');
      });*/
    });


    describe('Embed and Inject', function () {
      it('should have some content under and "Embeddable" heading', function () {
        var embedAndInject = tractor.findElement(protractor.By.css('#embed-and-inject'))
        expect(embedAndInject.getText()).toEqual('Embed and Inject');
      });
    });
  });
});