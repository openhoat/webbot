var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var util = webBot.util;
      logger.info('#%s insert base url for browser preview', step.index);
      webBot.browser.document.querySelector('head').insertAdjacentHTML('beforeend', util.format('<base href="%s">', webBot.browser.site));
      webBot.browser.viewInBrowser();
      setTimeout(done, 3000);
    };
  }
};

module.exports = that;