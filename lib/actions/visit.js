var logger = require('hw-logger').logger
  , that;

that = {
  build: function (webBot, step) {
    return function (done) {
      var util = webBot.util
        , uri;
      logger.info('#%s start', step.index);
      uri = util.getItemParam(step, 1);
      logger.info('#%s visiting : %s', step.index, uri);
      webBot.browser.
        visit(uri).
        then(function () {
          logger.info('#%s browser statusCode :', step.index, webBot.browser.statusCode);
          logger.info('#%s end', step.index);
        }).
        then(done).
        catch(done);
    };
  }
};

module.exports = that;