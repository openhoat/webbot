'use strict';

var pkg = require('../package')
  , util = require('util')
  , path = require('path')
  , yargs = require('yargs')
  , envArgs, argv, log, opt;

envArgs = process.env.WEBBOT_ARGS ? JSON.parse(process.env.WEBBOT_ARGS) : {};

argv = yargs
  .usage(util.format('Usage: %s --env [env] --scenario [scenario] --loglevel [trace|info|warn|error] --options [browser options] --commands [extra client commands]', pkg.name))
  .options({
    'dir': {
      description: 'Base directory of scenarii and configuration files (default : current dir)',
      alias: 'd',
      type: 'string',
      default: envArgs.dir || process.cwd()
    },
    'env': {
      description: 'Environnement name to use for configuration (example : live)',
      required: true,
      alias: 'e',
      type: 'string',
      default: envArgs.env
    },
    'scenario': {
      description: 'Scenario to execute (example : mywebtest)',
      required: true,
      alias: 's',
      type: 'string',
      default: envArgs.scenario
    },
    'options': {
      description: 'Webdriver browser options',
      alias: 'o',
      default: envArgs.options
    },
    'commands': {
      description: 'Extra client commands module to register (example : lib/myCustomCommands)',
      alias: 'c',
      type: 'string',
      default: envArgs.commands
    },
    'loglevel': {
      description: 'Log level to enable (error|warn|info|debug|trace)',
      alias: 'l',
      default: envArgs.loglevel || 'info'
    }
  })
  .example(util.format('%s -e live -s mywebtest -o \'{"desiredCapabilities":{"browserName": "firefox"}}\' -l trace', pkg.name), 'Execute mywebtest scenario on live environment with firefox and the log level trace')
  .argv;

opt = {
  scenario: {
    env: argv.env,
    name: argv.scenario
  },
  selenium: {},
  browser: {}
};

function initLog() {
  var levels = [];
  switch (argv.loglevel) {
    case 'trace':
      levels.push('trace');
    /* falls through */
    case 'debug':
      levels.push('debug');
    /* falls through */
    case 'info':
      levels.push('info');
    /* falls through */
    case 'warn':
      levels.push('warn');
    /* falls through */
    case 'error':
      levels.push('error');
  }
  process.env.DEBUG = util.format('*:%s', levels.join('|'));
  util = require('hw-util');
  util.logFactory.init(pkg.name);
  log = util.logFactory('webbot-cmd');
}

function initEnv() {
  var config = require('../config');
  if (argv.dir) {
    config.baseDir = path.resolve(process.cwd(), argv.dir);
  }
  opt = util.buildEffectiveConfig(opt, config);
  if (argv.options) {
    (function setOptions() {
      var options = JSON.parse(argv.options);
      log.debug('specified browser options :', options);
      opt.browser = util.buildEffectiveConfig(options, opt.browser);
    })();
  }
  if (argv.commands) {
    opt.browser.clientCommands = require(path.resolve(config.baseDir, argv.commands));
  }
  log.debug('options :', opt);
}

function playScenario() {
  var webbot = require('./webbot');
  webbot.playScenario(opt, function (err) {
    if (err) {
      log.error(err);
      process.exit(1);
      return;
    }
    process.exit(0);
  });
}

initLog();
initEnv();
playScenario();
