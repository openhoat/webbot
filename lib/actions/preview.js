var that;

that = {
  build: function (webBot, step) {
    return function (done) {
      webBot.browser.viewInBrowser();
      setTimeout(done, 3000);
    };
  }
};

module.exports = that;