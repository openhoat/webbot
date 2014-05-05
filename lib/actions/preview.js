'use strict';

var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var param1
        , util = webBot.util;
      logger.info('#%s insert base url for browser preview', step.index);
      param1 = util.getItemParam(step, 1);
      if (param1 && param1.toLowerCase() === 'true') {
        webBot.browser.document.querySelector('head').insertAdjacentHTML('beforeend', util.format('<base href="%s">', webBot.browser.site));
      }
      webBot.browser.viewInBrowser();
      setTimeout(done, 3000);
    };
  }
};

module.exports = that;