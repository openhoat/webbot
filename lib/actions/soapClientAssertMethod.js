'use strict';

var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var Q = require('niceq')
        , util = webBot.util
        , contextName, methodName, params, expectation, client;
      logger.info('#%s start', step.index);
      contextName = util.getItemParam(step, 1) || 'soapClient';
      methodName = util.getItemParam(step, 2);
      params = util.getItemParam(step, 3);
      expectation = util.getItemParam(step, 4);
      client = webBot.context[contextName];
      Q().
        niceThen(function (next) {
          logger.info('#%s invoking soap client method : %s', step.index, methodName);
          client[methodName](JSON.parse(params), next);
        }).
        spread(function (result) {
          util.execAssertFunc(webBot.browser, expectation, {result: result});
        }).
        then(function () {
          logger.info('#%s end', step.index);
        }).
        niceDone(done);
    };
  }
};

module.exports = that;