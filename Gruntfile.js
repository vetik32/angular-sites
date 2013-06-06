var fs = require('fs')
  , exec = require('child_process').exec
  , server
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
        src: ['sites/code.angularjs.org/snapshot', 'sites/code.angularjs.org']
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
    },
    server: {
      stop: {
        options: {
          command: 'stop'
        }
      },
      start: {
        options: {
          command: 'start'
        }
      },
      restart: {
        options: {
          command: 'restart'
        }
      },
      test: {
        options: {
          command: 'test'
        }
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('grunt-chmod');
  grunt.loadTasks('./lib/grunt-contrib-htaccess-to-json');

  grunt.registerTask('configure', ['replace', 'make-snapshot', 'chmod']);
  grunt.registerTask('test', ['mochacli']);

  grunt.registerTask('make-snapshot', function () {
    grunt.file.mkdir('sites/code.angularjs.org/snapshot');
  });

  grunt.registerMultiTask('server', function() {
    var config = this.options()
      , done = this.async();
    
    var testConfig = function (callback) {
      grunt.log.writeln('Testing nginx configuration');
      
      exec('sudo nginx -t -c ' + process.cwd() + '/server/config/nginx.conf', function (error, stdout, stderr) {
        stdout = stdout || stderr;
        
        if (stdout && stdout.indexOf('test is successful') && stdout.indexOf('syntax is ok')) {
          callback(error, true, stdout);
        }
        else {
          callback(error, false, stdout);  
        }
        
      });
    };
    
    switch (config.command) {
      case 'start':
        grunt.log.writeln('Preparing to start server.');

        testConfig(function (err, res, stdout) {
          if (res) {
            grunt.log.writeln(stdout);
            grunt.log.writeln('Config passes test, starting server...');

            exec('sudo nginx -c ' + process.cwd() + '/server/config/nginx.conf', function (err, stdout) {
              grunt.log.writeln('Server started');
              done();
            });  
          }
          else {
            grunt.log.error("Could not start server because of bad nginx configuration");
            grunt.log.error(err);
            grunt.log.write(stdout);
            done();
          }
        });
        break;

      case 'stop':
        exec('sudo nginx -s stop -c ' + process.cwd() + '/server/config/nginx.conf', function () {
          done();
        });
        break;

      case 'restart':
        testConfig(function (err, res, stdout) {
          if (res) {
            exec('sudo nginx -s reload -c' + process.cwd() + '/server/config/nginx.conf', function () {
              done();
            });
          }
          else {
            grunt.log.error('No server to restart');
            done();
          }
        });
        break;
      case 'test':
        testConfig(function (err, res, stdout) {
          if (res) {
            grunt.log.writeln(stdout);
            grunt.log.writeln('Config passes test.');
          }
          else {
            grunt.log.error("Test failed");
            grunt.log.error(err);
            done();
          }
        });
        break;

      default:
        grunt.log.error("No command specified in config" + JSON.stringify(config));
    }
  });
};