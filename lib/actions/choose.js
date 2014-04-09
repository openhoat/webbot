var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var util = webBot.util
        , param1;
      logger.info('#%s start', step.index);
      param1 = util.getItemParam(step, 1);
      logger.info("#%s selecting radio box option '%s'", step.index, param1);
      webBot.browser
        .choose(param1)
        .wait(function (e, browser) {
          logger.info('#%s end', step.index);
          done();
        });
    };
  }
};

module.exports = that;