module.exports = function(grunt) {
  grunt.registerTask('server', function () {
    var config = this.options()
      , done = this.async()
      , exec = require('child_process').exec;
    
    var logError = function () {
      for (var i = 0; i < arguments.length; i++) {
        grunt.log.error(arguments[i]);
      }
    };

    var log = function () {
      for (var i = 0; i < arguments.length; i++) {
        grunt.log.writeln(arguments[i]);
      }
    };

    var testConfig = function (callback) {
      log('Testing nginx configuration');
      
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

    var startNginx = function (done) {
      exec('sudo nginx -c ' + process.cwd() + '/server/config/nginx.conf', done);
    };

    var stopNginx = function (done) {
      exec('sudo nginx -s stop -c ' + process.cwd() + '/server/config/nginx.conf', done);
    };

    var reloadNginx = function (done) {
      exec('sudo nginx -s reload -c' + process.cwd() + '/server/config/nginx.conf', done);
    };
    
    switch (this.args[0]) {
      case 'start':
        testConfig(function (err, res, stdout) {
          if (!res || err) return done(err || stdout);
          startNginx(done);
        });
        break;

      case 'stop':
        stopNginx(done);
        break;

      case 'restart':
        testConfig(function (err, res, stdout) {
          if (!res || err) return done(err || stdout);
          reloadNginx(done);
        });
        break;

      case 'test':
        testConfig(function (err, res, stdout) {
          if (!res || err) return done("Test failed" + err);
          log(stdout, 'Config passes test.');
          done();
        });
        break;

      default:
        logError("No command specified in config", JSON.stringify(config));
    }
  });
};