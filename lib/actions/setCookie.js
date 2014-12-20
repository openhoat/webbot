'use strict';

var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var util = webBot.util
        , cookieName, cookieValue, cookieExpires, cookieDomain, cookiePath, cookie;
      logger.info('#%s start', step.index);
      cookieName = util.getItemParam(step, 1);
      cookieValue = util.getItemParam(step, 2);
      cookieExpires = util.getItemParam(step, 3);
      cookieDomain = util.getItemParam(step, 4);
      cookiePath = util.getItemParam(step, 5);
      if (cookieValue) {
        logger.info('#%s setting cookie %s to %s', step.index, cookieName, cookieValue);
        if (!cookieExpires) {
          cookieExpires = new Date();
          cookieExpires.setYear(1900 + cookieExpires.getYear() + 1);
        }
        cookie = {
          name: cookieName,
          value: cookieValue,
          expires: cookieExpires,
          domain: cookieDomain,
          path: cookiePath
        };
        logger.trace('setting cookie : %s', util.inspect(cookie, { depth: null }));
        if (typeof webBot.browser.setCookie === 'function') {
          webBot.browser.setCookie(cookie);
        } else {
          webBot.browser.cookies(cookie.domain, cookie.path || '/').set(cookie.name, cookie.value);
        }
      } else {
        logger.info('#%s removing cookie %s', step.index, cookieName);
        if (typeof webBot.browser.deleteCookie === 'function') {
          webBot.browser.deleteCookie(cookieName);
        } else {
          webBot.browser.cookies(cookie.domain, cookie.path || '/').remove(cookie.name);
        }
      }
      done();
    };
  }
};

module.exports = that;