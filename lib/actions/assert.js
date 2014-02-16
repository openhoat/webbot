var util = require('../util')
  , Q = require('q')
  , that;

that = {
  build: function (webBot, step) {
    return function () {
      var deferred = Q.defer();
      webBot.logger.info('#%s start', step.index);
      util.forEachItemParam(step, function (param) {
        webBot.logger.info('#%s checking assertion : %s', step.index, param);
        util.execAssertFunc(webBot.browser, param);
      });
      webBot.logger.info('#%s end', step.index);
      deferred.resolve();
      return deferred.promise;
    };
  }
};

module.exports = that;