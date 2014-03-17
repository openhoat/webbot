var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var util = webBot.util
        , param1, param2;
      logger.info('#%s start', step.index);
      param1 = util.getItemParam(step, 1);
      param2 = util.getItemParam(step, 2);
      logger.info('#%s attaching file "%s" to field "%s"', step.index, param2, param1);
      webBot.browser.attach(param1, param2).wait(function (e, browser) {
        logger.info('#%s end', step.index);
        done();
      });
    };
  }
};

module.exports = that;