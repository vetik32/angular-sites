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
    jasmine_node: {
      specNameMatcher: ".spec", // load only specs containing specNameMatcher
      projectRoot: "spec/",
      requirejs: false,
      forceExit: true,
      jUnit: {
        report: false,
        savePath : "./build/reports/jasmine/",
        useDotNotation: true,
        consolidate: true
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-jasmine-node');

  grunt.registerTask('configure', ['replace']);
  grunt.registerTask('test', ['jasmine_node'])
};