/**
 *
 * grunt-webdriver
 * https://github.com/christianbromann/grunt-webdriver
 *
 * Copyright (c) 2013 Christian Bromann
 * Licensed under the MIT license.
 *
 * checks if a selenium process is running
 * if not start standalone server automatically
 * @param  {Function} callback executes if selenium server is running
 * @param  {Function} done     executes grunt task
 * @param  {Object}   grunt    grunt object
 * @return null                obsolete
 */

var exec  = require('child_process').exec,
    spawn = require('child_process').spawn,
    fs    = require('fs'),
    path = require('path');

module.exports = function (callback, done, grunt) {
    exec('ps auxw | grep selenium-server-standalone | grep -v grep', [], function(error, stdout, stderr) {
        if(!stdout.length) {
            grunt.log.write('\nCouldn\'t find any selenium server process');
            grunt.log.writeln('\nStarting selenium server...');
        
            var jar = path.resolve('components/selenium-server-standalone-2.33.0/index.jar');
            var chrome = path.resolve('components/chromedriver_mac_26.0.1383.0/chromedriver');
            grunt.log.writeln(jar);
            grunt.log.writeln(chrome);
            
            var seleniumServer = spawn('java', ['-jar', jar, '-Dwebdriver.chrome.driver=' + chrome]);
            
            seleniumServer.stdout.on('data', function (data) {
                grunt.log.writeln(data);
                if(data.toString().indexOf('Started SocketListener') !== -1) {
                    grunt.log.write('\nServer started successfully!');
                    grunt.log.writeln('\nStarting tests now...\n');
                    callback();
                }
            });
            
        } else {
            callback();
        }
    });
};