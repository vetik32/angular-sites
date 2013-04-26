exports.getType = function () {
  return {
    '%{REQUEST_URI}': 'REQUEST_URI'
  }[type]
}

exports.getCondition = function (path, line, lineSplit) {
  var type = getRewriteType(lineSplit[1]);
  outputObject.rewrites[type] = outputObject.rewrites[type] || {};
  outputObject.rewrites[type][lineSplit[2]] = {};
};

exports.parse = function (path, lines) {
  var group = {conditions:[], rule: {}};

  lines.forEach(function (line) {
    var noSpaceLine = line.replace(/ /g, '').toLowerCase();
    var lineSplit = line.split(' ');
    
    if (noSpaceLine.indexOf('rewritecond') === 0) {
      group.conditions.push({
        test: lineSplit[1],
        pattern: lineSplit[2]
      });
    }
    else if (noSpaceLine.indexOf('rewriterule') === 0) {
      group.rule = {
        pattern: lineSplit[1],
        substitution: lineSplit[2]
      };
    }
  });
  /**
  * Takes in an array of lines that make up a rewrite block
  * and outputs and object like: 
  * { conditions: [{test: '%{request_uri}', pattern: '^/index\.php$'}], rule: {pattern: '^(.*)$', substitution: 'http://angularjs.org/?'}}
  */

  return group;
};