module.exports = function(grunt) {
  grunt.registerMultiTask('server', function () {
    var config = this.options()
      , done = this.async()
      , exec = require('child_process').exec;
    
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
            grunt.log.writeln('Sending reload signal to nginx');
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