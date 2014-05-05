'use strict';

var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var url = require('url')
        , Browser = require('zombie')
        , util = webBot.util
        , baseUrl
        , urlSpecs
        , login
        , pwd;
      logger.info('#%s start', step.index);
      baseUrl = util.getItemParam(step, 1);
      login = util.getItemParam(step, 2);
      pwd = util.getItemParam(step, 3);
      urlSpecs = url.parse(baseUrl);
      logger.info('#%s initializing browser with site : %s', step.index, baseUrl);
      webBot.browser = new Browser();
      webBot.browser.site = baseUrl;
      webBot.browser.runScripts = webBot.config.browser.runScripts;
      webBot.browser.loadCSS = webBot.config.browser.loadCSS;
      webBot.browser.waitFor = webBot.config.browser.waitFor;
      webBot.browser.maxWait = webBot.config.browser.maxWait;
      webBot.browser.debug = webBot.config.browser.debug;
      if (login) {
        logger.trace('#%s using ACL : %s/%s', step.index, login, pwd);
        webBot.browser.authenticate(urlSpecs.hostname).basic(login, pwd);
      }
      logger.info('#%s end', step.index);
      done();
    };
  }
};

module.exports = that;