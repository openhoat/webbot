var that;

that = {
  build: function (webBot, step) {
    return function (done) {
      var util = require('../util');
      process.stderr.write(util.format('html page content : %s\n', webBot.browser.html()));
      done();
    };
  }
};

module.exports = that;