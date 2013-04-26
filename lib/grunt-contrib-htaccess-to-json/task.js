module.exports = function (grunt) {
  grunt.registerTask('ht2j', 'Parse htaccess redirects into JSON', function () {
    grunt.config.requires('ht2j');
    
    var config = grunt.config('ht2j');
    var paths = config.paths;

    function processGroups (accessFile) {
      return accessFile.split('\n\n');
    }

    function processPath (path, index) {
      if (!path) grunt.log.error("No path in config");
      
      var outputObject = { redirects: [], rewrites: [] }
        , accessFile = fs.readFileSync(path.input).toString();

      if (!accessFile) return grunt.log.error("Could not load htaccess at path: " + path);

      function handleGroup(group) {
        var lines = group.split("\n");

        switch (identifyDirective(lines)) {
          case "redirect":
            outputObject.redirects = outputObject.redirects.concat(parseRedirectGroup(path, lines));
            break;
          default:
            break;
        }      
      }

      processGroups(accessFile).forEach(handleGroup);

      // accessFile.split('\n').forEach(handleDirective);
      fs.writeFileSync(path.output, JSON.stringify(outputObject, null, "  "));
    }

    function parseRedirectGroup (path, lines) {
      var redirects = [];
      lines.forEach(function (line) {
        var lineSplit = line.split(" ");
        var l = lineSplit.length;

        if ([3,4].indexOf(l) === -1) grunt.log.error('Not enough arguments for a redirect in ' + path + ': ' + line);

        redirects.push({
          origin: lineSplit[l -2 ],
          dest: lineSplit[l - 1],
          code: lineSplit.length === 4 ? parseInt(lineSplit[1], 10) : 302
        });
      });
      
      return redirects;
    }

    function getRewriteType (type) {
      return {
        '%{REQUEST_URI}': 'REQUEST_URI'
      }[type]
    }

    function parseRewriteCondition (path, line, lineSplit) {
      var type = getRewriteType(lineSplit[1]);
      outputObject.rewrites[type] = outputObject.rewrites[type] || {};
      outputObject.rewrites[type][lineSplit[2]] = {};
    }

    function identifyDirective (lines) {
      var noSpaceLine;

      for (var i = 0; i < lines.length; i++) {
        noSpaceLine = lines[i].replace(/ /g, "").toLowerCase();
        if (noSpaceLine.indexOf('redirect') === 0) {
          //This line is a redirect directive.
          return "redirect"; 
        }

        if (noSpaceLine.indexOf('rewritecond') === 0) {
          return "rewritecond";
        }

        if (noSpaceLine.indexOf('rewriterule') === 0) {
          return "rewriterule";
        }
      }

      if (noSpaceLine.indexOf("#") === 0) {
        //this line is empty or a comment
        return "comment";
      }

      return "empty";
    }

    paths.forEach(processPath);
  });
};