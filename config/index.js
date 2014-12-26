var util = require('hw-util')
  , envPath = './env/'
  , util = require('hw-util')
  , log = util.logFactory('config')
  , config;

config = {}; // contains all the configurations
config.all = require(envPath + 'all'); // load the common configuration for all environments
try {
  config[config.all.env] = require(envPath + config.all.env) || {}; // load the configuration matching current environment
} catch (err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err;
  }
}

config.effective = util.buildEffectiveConfig(config[config.all.env], config.all); // merge the all configuration and the one matching current environment

exports = module.exports = config.effective; // expose the resulting configuration