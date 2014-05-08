'use strict';

var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var chai = require('chai')
        , util = webBot.util
        , expect = chai.expect
        , contextName, descName, descValue, client;
      logger.info('#%s start', step.index);
      contextName = util.getItemParam(step, 1) || 'soapClient';
      descName = util.getItemParam(step, 2);
      descValue = util.getItemParam(step, 3);
      client = webBot.context[contextName];
      expect(eval('client.describe().' + descName)).to.eql(JSON.parse(descValue));
      logger.info('#%s end', step.index);
      done();
    };
  }
};

module.exports = that;