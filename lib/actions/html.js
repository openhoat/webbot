var that;

that = {
  build: function (webBot, step) {
    return function () {
      console.log('html page content :', webBot.browser.html());
    };
  }
};

module.exports = that;