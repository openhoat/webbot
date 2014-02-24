var that;

that = {
  build: function (webBot, step) {
    return function () {
      var Q = require('q')
        , logger = webBot.logger
        , deferred = Q.defer();
      logger.info('#%s start', step.index);
      logger.info("#%s waiting till browser is ready", step.index);
      webBot.browser.wait(deferred.makeNodeResolver());
      logger.info('#%s end', step.index);
      return deferred.promise;
    };
  }
};

module.exports = that;