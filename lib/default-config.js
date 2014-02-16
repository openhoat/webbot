var path = require('path')
  , fs = require('fs')
  , config;


config = {
  env: 'development',
  log4js: {
    enabled: true,
    level: "INFO"
  },
  logger: {
    enabled: true
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