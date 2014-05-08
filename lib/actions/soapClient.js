'use strict';

var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var soap = require('soap')
        , util = webBot.util
        , wsdlUrl, contextName, username, password;
      logger.info('#%s start', step.index);
      wsdlUrl = util.getItemParam(step, 1);
      contextName = util.getItemParam(step, 2) || 'soapClient';
      username = util.getItemParam(step, 3);
      password = util.getItemParam(step, 4);
      logger.info('#%s creating soap client : %s', step.index, wsdlUrl);
      soap.createClient(wsdlUrl, function (err, client) {
        if (err) {
          done(err);
          return;
        }
        if (username) {
          logger.trace('#%s using ACL : %s/%s', step.index, username, password);
          client.setSecurity(new soap.BasicAuthSecurity(username, password));
        }
        webBot.context[contextName] = client;
        logger.info('#%s end', step.index);
        done();
      });
    };
  }
};

module.exports = that;