var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var util = webBot.util
        , param1;
      logger.info('#%s start', step.index);
      logger.info("#%s back", step.index);
      webBot.browser.back(function (err) {
        logger.info('#%s end', step.index);
        if (err) {
          logger.error(err);
        }
        done();
      });
    };
  }
};

module.exports = that;