'use strict';

var that;

that = {
  build: function (webBot/*, step*/) {
    return function (done) {
      var util = require('../util');
      process.stderr.write(util.format('browser dump :%s\n', webBot.browser.dump()));
      done();
    };
  }
};

module.exports = that;