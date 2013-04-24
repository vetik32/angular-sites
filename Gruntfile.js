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
    }
  });
  grunt.loadNpmTasks('grunt-replace');

  grunt.registerTask('default', ['replace']);
};