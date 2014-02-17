var Q = require('q')
  , that;

that = {
  build: function (webBot, step) {
    return function () {
      var logger = webBot.logger
        , util = webBot.util
        , deferred = Q.defer()
        , uri;
      logger.info('#%s start', step.index);
      uri = util.getItemParam(step, 1);
      logger.info('#%s visiting : %s', step.index, uri);
      webBot.browser.
        visit(uri).
        then(function () {
          logger.info('#%s browser statusCode :', step.index, webBot.browser.statusCode);
          logger.info('#%s end', step.index);
          deferred.resolve();
        }).
        catch(deferred.reject);
      return deferred.promise;
    };
  }
};

module.exports = that;