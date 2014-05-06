'use strict';

var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var soap = require('soap')
        , Q = require('niceq')
        , chai = require('chai')
        , util = webBot.util
        , expect = chai.expect
        , wsdlUrl, contextName;
      logger.info('#%s start', step.index);
      wsdlUrl = util.getItemParam(step, 1);
      contextName = util.getItemParam(step, 2);
      Q().
        niceThen(function (next) {
          logger.info('#%s creating soap client : %s', step.index, wsdlUrl);
          soap.createClient(wsdlUrl, next);
        }).
        then(function (client) {
          expect(client).to.be.ok;
          webBot.context[contextName] = client;
        }).
        then(function () {
          logger.info('#%s end', step.index);
        }).
        niceDone(done);

      /*
       promise = promise.then()
       niceThen(function (client, next) {
       client.GetLastTradePrice({ tickerSymbol: 'AAPL'}, next);
       }).
       spread(function (result) {
       expect(parseFloat(result.price)).to.equal(19.56);
       }).*/
    }
  }
};

module.exports = that;