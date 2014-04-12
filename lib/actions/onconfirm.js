var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var util = webBot.util
        , param1, param2, response;
      logger.info('#%s start', step.index);
      param1 = util.getItemParam(step, 1);
      param2 = util.getItemParam(step, 2);
      response = false;
      if (param2 && param2.toLowerCase() === 'true') {
        response = true;
      }
      logger.info("#%s answering confirm box '%s'", step.index, param1);
      webBot.browser.onconfirm(function (question) {
        var matches;
        matches = !param1 || question.match(new RegExp(param1));
        return matches ? response : false;
      });
      logger.info('#%s end', step.index);
      done();
    };
  }
};

module.exports = that;