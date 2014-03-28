var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var util = webBot.util
        , param1;
      logger.info('#%s start', step.index);
      param1 = util.getItemParam(step, 1);
      logger.info("#%s pressing button '%s'", step.index, param1);
      webBot.browser.pressButton(param1, function (err) {
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