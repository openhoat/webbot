var logger = require('hw-logger').logger
  , that;

that = {
  build: function (webBot, step) {
    return function (done) {
      var util = webBot.util;
      logger.info('#%s start', step.index);
      util.forEachItemParam(step, function (param) {
        logger.info('#%s checking assertion : %s', step.index, param);
        util.execAssertFunc(webBot.browser, param);
      });
      logger.info('#%s end', step.index);
      done();
    };
  }
};

module.exports = that;