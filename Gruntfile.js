fs = require('fs');

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    replace: {
      dist: {
        options: {
          variables: {
            'pwd': process.cwd(),
            'user': process.env.USER
          },
          prefix: '@@'
        },
        files: [{
          flatten: true, expand: true, src: ['server/sample/nginx.conf', 'server/sample/sites.conf', 'server/sample/fastcgi.conf'], dest: 'server/config/'
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
  grunt.registerMultiTask('test', ['mochacli']);
};