'use strict';

var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var util = webBot.util
        , param1, duration;
      logger.info('#%s start', step.index);
      param1 = util.getItemParam(step, 1);
      if (param1) {
        duration = parseInt(param1, 10);
      }
      logger.info('#%s sleeping %ss', step.index, duration);
      setTimeout(done, duration * 1000);
    };
  }
};

module.exports = that;