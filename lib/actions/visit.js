var util = require('../util')
  , Q = require('q')
  , that;

that = {
  build: function (webBot, step) {
    return function () {
      var deferred = Q.defer()
        , uri;
      webBot.logger.info('#%s start', step.index);
      uri = util.getItemParam(step, 1);
      webBot.logger.info('#%s visiting : %s', step.index, uri);
      webBot.browser.
        visit(uri).
        then(function () {
          webBot.logger.info('#%s browser statusCode :', step.index, webBot.browser.statusCode);
          webBot.logger.info('#%s end', step.index);
          deferred.resolve();
        }).
        catch(deferred.reject);
      return deferred.promise;
    };
  }
};

module.exports = that;