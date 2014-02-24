var that;

that = {
  build: function (webBot, step) {
    return function () {
      var Q = require('q')
        , deferred = Q.defer();
      webBot.browser.viewInBrowser();
      setTimeout(deferred.makeNodeResolver(), 3000);
      return deferred.promise;
    };
  }
};

module.exports = that;