exports.getWidget = function(feather, cb) {
  cb(null, {
    name: "api_tester.embeddedWidget",
    path: "widgets/embeddedWidget/"
  });
};