// An example configuration file.
exports.config = {
  // The address of a running selenium server. If this is specified,
  // seleniumServerJar and seleniumPort will be ignored.
  // seleniumAddress: 'http://localhost:4444/wd/hub',
  seleniumServerJar: './components/selenium-server-standalone-2.33.0/index.jar',
  seleniumPort: 4444,
  chromeDriver: (process.platform === 'darwin') ?
    './components/chromedriver_mac_26.0.1383.0/chromedriver' :
    './components/chromedriver_linux64_26.0.1383.0/chromedriver',

  seleniumArgs: [],

  // A base URL for your application under test. Calls to protractor.get()
  // with relative paths will be prepended with this.
  baseUrl: '',

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome'
  },
  specs: [
    // 'test/errors.angularjs.org.spec.js',
    'test/angularjs.org.spec.js',
    'test/blog.angularjs.org.spec.js',
    'test/builtwith.angularjs.org.spec.js',
    'test/ci.angularjs.org.spec.js',
    'test/code.angularjs.org.spec.js',
    'test/dashboard.angularjs.org.spec.js',
    // 'test/docs.angularjs.org.spec.js'
  ],
  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    // onComplete will be called before the driver quits.
    onComplete: null,
    isVerbose: true,
    showColors: true,
    includeStackTrace: true
  }
};
