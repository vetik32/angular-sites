var redirect = require('./lib/redirect')
  , rewrite = require('./lib/rewrite')
  , processor = require('./lib/processor')
  , fs = require('fs');

module.exports = function (grunt) {
  grunt.registerTask('ht2j', 'Parse htaccess redirects into JSON', function () {
    grunt.config.requires('ht2j');
    
    var config = grunt.config('ht2j');
    var paths = config.paths;

    function addGroupToOutput(group, outputObject, path) {
      var lines = group.split("\n");

      switch (processor.identifyDirective(lines)) {
        case "redirect":
          outputObject.redirects = outputObject.redirects.concat(redirect.parse(path, lines));
          break;
        case "rewritecond":
          outputObject.rewrites.push(rewrite.parse(path, lines));
          break;
        default:
          break;
      }      
    }

    function processPath (path, index) {
      if (!path) grunt.log.error("No path in config");
      
      var outputObject = { redirects: [], rewrites: [] }
        , accessFile = fs.readFileSync(path.input).toString();

      if (!accessFile) return grunt.log.error("Could not load htaccess at path: " + path);

      processor.getGroups(accessFile).forEach(function (group) {
        addGroupToOutput(group, outputObject, path);
      });

      fs.writeFileSync(path.output, JSON.stringify(outputObject, null, "  "));
    }

    paths.forEach(processPath);
  });
};