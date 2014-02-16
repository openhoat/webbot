var util = require('../util')
  , Q = require('q')
  , that;

that = {
  build: function (webBot, step) {
    return function () {
      var chai = require('chai')
        , expect = chai.expect
        , deferred = Q.defer()
        , param1, param2;
      webBot.logger.info('#%s start', step.index);
      param1=util.getItemParam(step, 1);
      param2=util.getItemParam(step, 2);
      webBot.logger.info("#%s checking that '%s' content equals to '%s'", step.index, param1, param2);
      expect(webBot.browser.text(param1)).to.equal(param2);
      webBot.logger.info('#%s end', step.index);
      deferred.resolve();
      return deferred.promise;
    };
  }
};

module.exports = that;