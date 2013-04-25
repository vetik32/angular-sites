module.exports = function (grunt) {
  grunt.registerTask('htaccessToJSON', 'Parse htaccess redirects into JSON', function () {
    grunt.config.requires('htaccessToJSON');
    
    var config = grunt.config('htaccessToJSON');
    var paths = config.paths;

    paths.forEach(function (path) {
      var outputObject = {};
      var access = fs.readFileSync(path.input).toString();

      if (!access) return grunt.log.error("Could not load htaccess at path: " + path);

      function checkDirective (line) {
        var noSpaceLine = line.replace(/ /g, "");
        if (!noSpaceLine || noSpaceLine.indexOf("#") === 0) {
          //this line is empty or a comment
          return;
        }

        if (noSpaceLine.indexOf('redirect') === 0) {
          //This line is a redirect directive.
          var lineSplit = line.split(" ");
          outputObject['redirects'] = outputObject['redirects'] || {};
          
          if (lineSplit.length === 4) {
            outputObject['redirects'][lineSplit[2]] = {
              dest: lineSplit[3],
              code: lineSplit[1]
            }
          }
          else if (lineSplit.length === 3) {
            outputObject['redirects'][lineSplit[2]] = {dest: lineSplit[2], code: 301}
          }
          else {
            grunt.log.error('Not a valid redirect in ' + path + ': ' + line);
          }
          
        }
        //TODO: Implement other directives.
      }

      access.split('\n').forEach(checkDirective);
      fs.writeFileSync(path.output, JSON.stringify(outputObject, null, "  "));
    });
  });
};