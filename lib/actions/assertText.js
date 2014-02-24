var that;

that = {
  build: function (webBot, step) {
    return function () {
      var chai = require('chai')
        , logger = webBot.logger
        , util = webBot.util
        , expect = chai.expect
        , param1, param2;
      logger.info('#%s start', step.index);
      param1 = util.getItemParam(step, 1);
      param2 = util.getItemParam(step, 2);
      logger.info("#%s checking that '%s' content equals to '%s'", step.index, param1, param2);
      expect(webBot.browser.text(param1)).to.equal(param2);
      logger.info('#%s end', step.index);
    };
  }
};

module.exports = that;