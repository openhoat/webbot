var path = require('path')
  , fs = require('fs')
  , config;

config = {
  env: 'development',
  browser: {
    runScripts: true,
    loadCSS: false,
    maxWait: 3 * 60,
    debug: false
  },
  log: {
    level: 'info',
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