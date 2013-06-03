fs = require('fs');

var environments = {
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
    wwwServer: 'www.angularjs.org',
    builtwithServer: 'builtwith.angularjs.org',
    docsServer: 'docs.angularjs.org',
    codeServer: 'code.angularjs.org',
    dashboardServer: 'dashboard.angularjs.org'
  }
}

module.exports = function (grunt) {
  var env = environments[grunt.option('target')] || environments.local;
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
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
  
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadTasks('./lib/grunt-contrib-htaccess-to-json');

  grunt.registerTask('configure', ['replace']);
  grunt.registerTask('test', ['mochacli']);
};