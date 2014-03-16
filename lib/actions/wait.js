var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      logger.info('#%s start', step.index);
      logger.info("#%s waiting till browser is ready", step.index);
      webBot.browser.wait(function (e, browser) {
        logger.info('#%s end', step.index);
        done();
      });
    };
  }
};

module.exports = that;