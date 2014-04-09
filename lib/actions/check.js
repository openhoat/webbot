var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var util = webBot.util
        , param1, param2, enabled;
      logger.info('#%s start', step.index);
      param1 = util.getItemParam(step, 1);
      param2 = util.getItemParam(step, 2);
      enabled = true;
      if (param2 && param2.toLowerCase() === 'false') {
        enabled = false;
      }
      logger.info("#%s %s checkbox '%s'", step.index, enabled ? 'checking' : 'unchecking', param1);
      (function () {
        return enabled ? webBot.browser.check(param1) : webBot.browser.uncheck(param1);
      })().wait(function (e, browser) {
        logger.info('#%s end', step.index);
        done();
      });
    };
  }
};

module.exports = that;