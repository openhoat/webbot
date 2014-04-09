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
      logger.info("#%s filling field '%s' with '%s'", step.index, param1, param2);
      webBot.browser
        .fill(param1, param2)
        .wait(function (e, browser) {
          logger.info('#%s end', step.index);
          done();
        });
    };
  }
};

module.exports = that;