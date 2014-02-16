var util = require('../util')
  , Q = require('q')
  , that;

that = {
  build: function (webBot, step) {
    return function () {
      webBot.browser.viewInBrowser();
    };
  }
};

module.exports = that;