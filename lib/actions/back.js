var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var util = webBot.util;
      logger.info('#%s start', step.index);
      logger.info("#%s back", step.index);
      webBot.browser.back(function (err) {
        logger.info('#%s end', step.index);
        (util.actionErrorHandler(webBot, step, done))(err);
      });
    };
  }
};

module.exports = that;