'use strict';

var that;

that = {
  build: function (webBot, step) {
    return function (done) {
      var util = require('../util')
        , param1;
      param1 = util.getItemParam(step, 1);
      process.stderr.write(util.format('html content of \'%s\' : %s\n', param1 || 'page', webBot.browser.html(param1)));
      done();
    };
  }
};

module.exports = that;