var path = require('path')
  , fs = require('fs')
  , config, userAgents;

userAgents = {
  firefox25: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:25.0) Gecko/20100101 Firefox/25.0',
  chrome32: 'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1667.0 Safari/537.36'
};

config = {
  env: 'development',
  browser: {
    runScripts: true,
    loadCSS: false,
    waitFor: 1000,
    maxWait: 3 * 60,
    userAgent: userAgents.chrome32,
    debug: false
  },
  log: {
    level: 'error',
    maxRecordSize: 0
  }
};

(function configureDefaultActions() {
  var actionsDir;
  actionsDir = path.join(__dirname, 'actions');
  config.actions = {};
  fs.readdirSync(actionsDir).forEach(function (file) {
    var actionName;
    actionName = path.basename(file, '.js');
    config.actions[actionName] = path.join(actionsDir, file);
  });
})();

module.exports = config;