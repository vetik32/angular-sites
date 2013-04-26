exports.getGroups = function (accessFile) {
  return accessFile.split('\n\n');
};

exports.identifyDirective = function (group) {
  var noSpaceLine;

  for (var i = 0; i < group.length; i++) {
    noSpaceLine = group[i].replace(/ /g, "").toLowerCase();
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