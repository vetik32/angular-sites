exports.parse = function (path, lines) {
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
};