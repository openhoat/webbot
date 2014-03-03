var that;

that = {
  build: function (webBot, step) {
    return function () {
      var Q = require('q')
        , log = webBot.log
        , util = webBot.util
        , deferred = Q.defer()
        , uri;
      log.info('#%s start', step.index);
      uri = util.getItemParam(step, 1);
      log.info('#%s visiting : %s', step.index, uri);
      webBot.browser.
        visit(uri).
        then(function () {
          log.info('#%s browser statusCode :', step.index, webBot.browser.statusCode);
          log.info('#%s end', step.index);
          deferred.resolve();
        }).
        catch(deferred.reject);
      return deferred.promise;
    };
  }
};

module.exports = that;