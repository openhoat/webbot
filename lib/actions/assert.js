'use strict';

var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var util = webBot.util;
      logger.info('#%s start', step.index);
      util.forEachItemParam(step, function (index, param) {
        logger.info('#%s checking assertion : %s', step.index, param);
        util.execAssertFunc(webBot.browser, param);
      });
      logger.info('#%s end', step.index);
      done();
    };
  }
};

module.exports = that;