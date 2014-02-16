var util = require('../util')
  , Q = require('q')
  , that;

that = {
  build: function (webBot, step) {
    return function () {
      webBot.logger.info('#%s html :', step.index, webBot.browser.html());
    };
  }
};

module.exports = that;