var that;

that = {
  build: function (webBot, step) {
    return function () {
      var Q = require('q')
        , logger = webBot.logger
        , util = webBot.util
        , deferred = Q.defer()
        , param1;
      logger.info('#%s start', step.index);
      param1 = util.getItemParam(step, 1);
      logger.info("#%s clicking '%s'", step.index, param1);
      webBot.browser.clickLink(param1, deferred.makeNodeResolver());
      logger.info('#%s end', step.index);
      return deferred.promise;
    };
  }
};

module.exports = that;