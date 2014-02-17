var that;

that = {
  build: function (webBot, step) {
    return function () {
      var logger = webBot.logger
        , util = webBot.util
        , chai = require('chai')
        , expect = chai.expect
        , param1, elapsed;
      logger.info('#%s start', step.index);
      param1 = util.getItemParam(step, 1);
      elapsed = webBot.elapsedTimeMs();
      logger.info("#%s checking that elapsed time (%sms) not greater than %sms", step.index, elapsed, param1);
      expect(elapsed).to.be.at.most(parseInt(param1, 10));
      logger.info('#%s end', step.index);
    };
  }
};

module.exports = that;