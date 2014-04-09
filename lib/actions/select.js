var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var util = webBot.util
        , param1, param2, param3, enabled;
      logger.info('#%s start', step.index);
      param1 = util.getItemParam(step, 1);
      param2 = util.getItemParam(step, 2);
      param3 = util.getItemParam(step, 3);
      enabled = true;
      if (param3 && param3.toLowerCase() === 'false') {
        enabled = false;
      }
      logger.info("#%s %s option '%s' with '%s'", step.index, enabled ? 'selecting' : 'unselecting', param1, param2);
      (function () {
        return enabled ? webBot.browser.select(param1, param2) : webBot.browser.unselect(param1, param2);
      })().wait(function (e, browser) {
        logger.info('#%s end', step.index);
        done();
      });
    };
  }
};

module.exports = that;