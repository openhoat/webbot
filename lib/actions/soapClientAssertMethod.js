'use strict';

var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var util = webBot.util
        , contextName, methodName, params, expectation, client;
      logger.info('#%s start', step.index);
      contextName = util.getItemParam(step, 1) || 'soapClient';
      methodName = util.getItemParam(step, 2);
      params = util.getItemParam(step, 3);
      try {
        params = JSON.parse(params);
      } catch (err) {
      }
      expectation = util.getItemParam(step, 4);
      client = webBot.context[contextName];
      logger.info('#%s invoking soap client method : %s', step.index, methodName);
      client[methodName](params, function (err, result) {
        if (err) {
          done(err);
          return;
        }
        util.execAssertFunc(webBot.browser, expectation, {result: result});
        logger.info('#%s end', step.index);
        done();
      });
    };
  }
};

module.exports = that;