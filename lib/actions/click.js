var util = require('../util')
  , Q = require('q')
  , that;

that = {
  build: function (webBot, step) {
    return function () {
      var deferred = Q.defer()
        , link;
      webBot.logger.info('#%s start', step.index);
      link = util.getItemParam(step, 1);
      webBot.logger.info("#%s clicking '%s'", step.index, link);
      that.browser.clickLink(link, deferred.makeNodeResolver());
      webBot.logger.info('#%s end', step.index);
      return deferred.promise;
    };
  }
};

module.exports = that;