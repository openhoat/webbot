var that;

that = {
  build: function (webBot, step) {
    return function () {
      var Q = require('q')
        , log = webBot.log
        , deferred = Q.defer();
      log.info('#%s start', step.index);
      log.info("#%s waiting till browser is ready", step.index);
      webBot.browser.wait(deferred.makeNodeResolver());
      log.info('#%s end', step.index);
      return deferred.promise;
    };
  }
};

module.exports = that;