var that;

that = {
  build: function (webBot, step) {
    return function () {
      var log = webBot.log
        , util = webBot.util;
      log.info('#%s start', step.index);
      util.forEachItemParam(step, function (param) {
        log.info('#%s checking assertion : %s', step.index, param);
        util.execAssertFunc(webBot.browser, param);
      });
      log.info('#%s end', step.index);
    };
  }
};

module.exports = that;