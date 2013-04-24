module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    replace: {
      dist: {
        options: {
          variables: {
            'pwd': process.cwd()
          },
          prefix: '@@'
        },
        files: [{
          flatten: true, expand: true, src: ['server/sample/nginx.conf', 'server/sample/sites.conf'], dest: 'server/config/'
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
      all: ['test/*.js']
    }
  });
  
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-mocha-cli');

  grunt.registerTask('configure', ['replace']);
  grunt.registerTask('test', ['mochacli'])
};