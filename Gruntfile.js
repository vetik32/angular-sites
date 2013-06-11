var fs = require('fs')
  , server
  , seleniumStarter = require('./lib/grunt-selenium.js')
  , environments = {
      local: {
        'wwwPort': '8000',
        'builtwithPort' : '8001',
        'docsPort': '8002',
        'codePort': '8003',
        'dashboardPort': '8004',
        'wwwServer': 'localhost',
        'builtwithServer': 'localhost',
        'docsServer': 'localhost',
        'codeServer': 'localhost',
        'dashboardServer': 'localhost'
      },
      dev: {
        wwwPort: '80',
        builtwithPort : '80',
        docsPort: '80',
        codePort: '80',
        dashboardPort: '80',
        wwwServer: 'dev.angularjs.org',
        builtwithServer: 'dev.builtwith.angularjs.org',
        docsServer: 'dev.docs.angularjs.org',
        codeServer: 'dev.code.angularjs.org',
        dashboardServer: 'dev.dashboard.angularjs.org'
      },
      prod: {
        wwwPort: '80',
        builtwithPort : '80',
        docsPort: '80',
        codePort: '80',
        dashboardPort: '80',
        wwwServer: 'angularjs.org',
        builtwithServer: 'builtwith.angularjs.org',
        docsServer: 'docs.angularjs.org',
        codeServer: 'code.angularjs.org',
        dashboardServer: 'dashboard.angularjs.org'
      }
    };

module.exports = function (grunt) {
  var env = environments[grunt.option('target')] || environments.local;
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    chmod: {
      options: {
        mode: '777',
      },
      snapshot: {
        src: process.env.USER === 'root' ? ['sites/code.angularjs.org/snapshot', 'sites/code.angularjs.org', 'components/chromedriver_mac_26.0.1383.0/chromedriver'] : []
      }
    },
    replace: {
      dist: {
        options: {
          variables: grunt.util._.extend(env, {
            user: process.env.USER,
            pwd: process.cwd()
          }),
          prefix: '@@'
        },
        files: [{
          flatten: true, expand: true, src: ['server/sample/nginx.conf', 'server/sample/sites.conf', 'server/sample/fastcgi.conf', 'server/sample/env-config.json'], dest: 'server/config/'
        }]
      }
    },
    mochacli: {
      options: {
        require: ['expect.js'],
        reporter: 'nyan',
        bail: true,
        timeout: 10000
      },
      root: ['test/angularjs.org.spec.js'],
      code: ['test/code.angularjs.org.spec.js'],
      docs: ['test/docs.angularjs.org.spec.js'],
      ci: ['test/ci.angularjs.org.spec.js'],
      blog: ['test/blog.angularjs.org.spec.js'],
      dashboard: ['test/dashboard.angularjs.org.spec.js'],
      builtwith: ['test/builtwith.angularjs.org.spec.js']
    },
    ht2j: {
      paths: [{
        output: 'server/config/angularjs.org.htaccess.json',
        input: 'sites/angularjs.org/.htaccess'
      },
      {
        output: 'server/config/code.angularjs.org.htaccess.json',
        input: 'sites/code.angularjs.org/.htaccess'
      },
      {
        output: 'server/config/builtwith.angularjs.org.htaccess.json',
        input: 'sites/builtwith.angularjs.org/.htaccess'
      },
      {
        output: 'server/config/dashboard.angularjs.org.htaccess.json',
        input: 'sites/dashboard.angularjs.org/.htaccess'
      }]
    }
  });

  grunt.registerTask('make-snapshot', function () {
    grunt.file.mkdir('sites/code.angularjs.org/snapshot');
  });

  grunt.registerTask('selenium', "Start selenium server to run end-to-end tests", function () {
    var done = this.async();
    seleniumStarter(done, null, grunt);
  });
  
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('grunt-chmod');
  grunt.loadTasks('./lib/grunt-contrib-htaccess-to-json');
  grunt.loadTasks('./lib/grunt-server');
  
  grunt.registerTask('configure', ['replace', 'make-snapshot', 'chmod']);
  grunt.registerTask('test', ['selenium', 'mochacli']);
  grunt.registerTask('start', ['nginx:start']);
  grunt.registerTask('stop', ['nginx:stop']);
  grunt.registerTask('reload', ['nginx:restart']);
};