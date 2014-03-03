var that;

that = {
  build: function (webBot, step) {
    return function () {
      var Q = require('q')
        , log = webBot.log
        , util = webBot.util
        , deferred = Q.defer()
        , param1;
      log.info('#%s start', step.index);
      param1 = util.getItemParam(step, 1);
      log.info("#%s clicking '%s'", step.index, param1);
      webBot.browser.clickLink(param1, deferred.makeNodeResolver());
      log.info('#%s end', step.index);
      return deferred.promise;
    };
  }
};

module.exports = that;