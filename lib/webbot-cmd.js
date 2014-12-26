'use strict';

var util = require('util')
  , path = require('path')
  , yargs = require('yargs')
  , argv, log, opt;

argv = yargs
  .usage('Usage: $0 --env [env] --scenario [scenario] --loglevel [trace|info|warn|error] --capabilities [webdriver desired capabilities]')
  .options({
    'dir': {
      description: 'Base directory of scenarii and configuration files (default : current dir)',
      alias: 'd',
      type: 'string',
      default: process.cwd()
    },
    'env': {
      description: 'Environnement name to use for configuration (example : live)',
      required: true,
      alias: 'e',
      type: 'string'
    },
    'scenario': {
      description: 'Scenario to execute (example : my-super-test)',
      required: true,
      alias: 's',
      type: 'string'
    },
    'capabilities': {
      description: 'Webdriver desired capabilities to use',
      alias: 'c'
    },
    'loglevel': {
      description: 'Log level to enable (error|warn|info|debug|trace)',
      alias: 'l',
      default: 'info'
    }
  })
  .example('$0 -e live -s 1-simple -c \'{"browserName": "firefox"}\' -l trace', 'Execute my-super-test scenario on production with firefox and the log level trace')
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
      opt.browser.verbose = opt.selenium.verbose = true;
      opt.browser.logLevel = 'verbose';
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
  log = util.logFactory('webbot-cmd');
}

function initEnv() {
  var config = require('../config');
  if (argv.dir) {
    config.baseDir = path.resolve(process.cwd(), argv.dir);
  }
  opt = util.buildEffectiveConfig(opt, config);
  if (argv.capabilities) {
    (function setCapabilities() {
      var capabilities = JSON.parse(argv.capabilities);
      log.trace('specified browser capabilities :', capabilities);
      opt.browser.desiredCapabilities = util.buildEffectiveConfig(capabilities, opt.browser.desiredCapabilities);
    })();
  }
  log.trace('options :', opt);
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
