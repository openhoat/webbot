var that;

that = {
  build: function (webBot, step) {
    return function () {
      var url = require('url')
        , log = webBot.log
        , util = webBot.util
        , baseUrl
        , urlSpecs
        , login
        , pwd;
      log.info('#%s start', step.index);
      baseUrl = util.getItemParam(step, 1);
      login = util.getItemParam(step, 2);
      pwd = util.getItemParam(step, 3);
      urlSpecs = url.parse(baseUrl);
      log.info('#%s initializing browser with site : %s', step.index, baseUrl);
      webBot.browser.site = baseUrl;
      webBot.browser.runScripts = webBot.config.runScripts;
      webBot.browser.loadCSS = webBot.config.loadCSS;
      webBot.browser.maxWait = webBot.config.maxWait;
      webBot.browser.debug = webBot.config.debug;
      if (login) {
        webBot.browser.authenticate(urlSpecs.hostname).basic(login, pwd);
      }
      log.info('#%s end', step.index);
    };
  }
};

module.exports = that;