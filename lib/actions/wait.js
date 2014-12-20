'use strict';

var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var util = webBot.util
        , param1, param2, duration, waitCb;
      logger.info('#%s start', step.index);
      param1 = util.getItemParam(step, 1);
      param2 = util.getItemParam(step, 2);
      if (param1) {
        duration = parseInt(param1, 10);
      }
      waitCb = function (/*e, browser*/) {
        logger.info('#%s end', step.index);
        done();
      };
      if (param2) {
        logger.info('#%s waiting till "%s" DOM element is ready', step.index, param2);
        webBot.browser.wait({element: param2, duration: duration}, function () {
          logger.trace('ready');
          waitCb();
        });
      } else {
        if (duration) {
          logger.info('#%s waiting for %sms, till browser is ready', step.index, duration);
          webBot.browser.wait(duration, waitCb);
        } else {
          logger.info('#%s waiting till browser is ready', step.index);
          webBot.browser.wait(waitCb);
        }
      }
    };
  }
};

module.exports = that;