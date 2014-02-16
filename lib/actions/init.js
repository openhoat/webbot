var util = require('../util')
  , url = require('url')
  , that;

that = {
  build: function (webBot, step) {
    return function () {
      var baseUrl
        , urlSpecs
        , login
        , pwd;
      webBot.logger.info('#%s start', step.index);
      baseUrl = util.getItemParam(step, 1);
      login = util.getItemParam(step, 2);
      pwd = util.getItemParam(step, 3);
      urlSpecs = url.parse(baseUrl);
      webBot.logger.info('#%s initializing browser with site : %s', step.index, baseUrl);
      webBot.browser.site = baseUrl;
      webBot.browser.runScripts = true;
      webBot.browser.loadCSS = false;
      webBot.browser.maxWait = 3 * 60;
      webBot.browser.debug = false;
      if (login) {
        webBot.browser.authenticate(urlSpecs.hostname).basic(login, pwd);
      }
      webBot.logger.info('#%s end', step.index);
    };
  }
};

module.exports = that;