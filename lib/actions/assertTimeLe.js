var that;

that = {
  build: function (webBot, step) {
    return function () {
      var chai = require('chai')
        , log = webBot.log
        , util = webBot.util
        , expect = chai.expect
        , param1, elapsed;
      log.info('#%s start', step.index);
      param1 = util.getItemParam(step, 1);
      elapsed = webBot.elapsedTimeMs();
      log.info("#%s checking that elapsed time (%sms) not greater than %sms", step.index, elapsed, param1);
      expect(elapsed).to.be.at.most(parseInt(param1, 10));
      log.info('#%s end', step.index);
    };
  }
};

module.exports = that;