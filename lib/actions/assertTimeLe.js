var logger = require('hw-logger').logger
  , that;

that = {
  build: function (webBot, step) {
    return function (done) {
      var chai = require('chai')
        , util = webBot.util
        , expect = chai.expect
        , param1, elapsed;
      logger.info('#%s start', step.index);
      param1 = util.getItemParam(step, 1);
      elapsed = webBot.elapsedTimeMs();
      logger.info("#%s checking that elapsed time (%sms) not greater than %sms", step.index, elapsed, param1);
      expect(elapsed).to.be.at.most(parseInt(param1, 10));
      logger.info('#%s end', step.index);
      done();
    };
  }
};

module.exports = that;