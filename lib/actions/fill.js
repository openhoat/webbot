var that;

that = {
  build: function (webBot, step) {
    return function () {
      var log = webBot.log
        , util = webBot.util
        , param1,param2;
      log.info('#%s start', step.index);
      param1= util.getItemParam(step, 1);
      param2= util.getItemParam(step, 2);
      log.info("#%s filling field '%s' with '%s'", step.index, param1,param2);
      webBot.browser.fill(param1, param2);
      log.info('#%s end', step.index);
    };
  }
};

module.exports = that;