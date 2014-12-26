'use strict';

var webdriverio = require('webdriverio')
  , config = require('../config')
  , path = require('path')
  , Promise = require('bluebird')
  , http = require('http')
  , selenium = require('selenium-standalone')
  , util = require('hw-util')
  , chai = require('chai')
  , expect = chai.expect
  , log = util.logFactory('webbot')
  , state, webbot = exports;

state = {
  browser: null,
  server: null,
  serverRunning: false,
  scenario: null
};

webbot.addBrowserCommands = function (opt, cb) {
  var args = util.optionCallbackArgParser.apply(null, arguments);
  opt = args.opt;
  cb = args.cb;
  return new Promise(
    function (resolve/*, reject*/) {
      function registerClientCommand(commands) {
        var browser;
        browser = webbot.getBrowser();
        Object.keys(commands).forEach(function (name) {
          browser = browser.addCommand(name, commands[name]);
        });
        log.debug('registered client commands :', commands);
      }

      registerClientCommand(require('./client-commands'));
      if (opt.clientCommands) {
        registerClientCommand(opt.clientCommands);
      }
      resolve();
    })
    .nodeify(cb);
};

webbot.checkSelenium = function (opt, cb) {
  var args = util.optionCallbackArgParser.apply(null, arguments);
  opt = args.opt;
  cb = args.cb;
  return new Promise(
    function (resolve/*, reject*/) {
      http.get(opt, function () {
        log.debug('selenium server response detected');
        resolve(true);
      }).on('error', function (/*err*/) {
        log.debug('no selenium server responding');
        resolve(false);
      });
    })
    .nodeify(cb);
};

webbot.getBrowser = function () {
  if (!state.browser) {
    throw new Error('Browser not initialized');
  }
  return state.browser;
};

webbot.getScenario = function () {
  return state.scenario || {};
};

webbot.helpers = {
  expectValueChecker: function (expectedValue) {
    return function (err, value) {
      if (err) {
        log.error(err);
      }
      expect(err).to.be.undefined;
      if (expectedValue instanceof RegExp) {
        expect(value).to.match(expectedValue);
      } else {
        expect(value).to.equal(expectedValue);
      }
    };
  },
  waitForValueChecker: function (elements, value) {
    var cb = arguments[arguments.length - 1]
      , i, elem
      , interval = setInterval(function () {
        for (i = 0; i < elements.length; ++i) {
          elem = elements[i];
          if (elem.value === value) {
            window.clearInterval(interval);
            return cb(true);
          }
        }
      }, 100);
  }
};

webbot.init = function (opt, cb) {
  var args = util.optionCallbackArgParser.apply(null, arguments);
  opt = args.opt;
  cb = args.cb;
  return webbot
    .checkSelenium(opt.selenium)
    .then(function (running) {
      if (!running && !state.serverRunning) {
        return webbot.startSelenium(opt.selenium || {});
      }
      log.debug('selenium server is already running');
    })
    .then(function () {
      return webbot.initBrowser(opt.browser);
    })
    .nodeify(cb);
};

webbot.initBrowser = function (opt, cb) {
  var args = util.optionCallbackArgParser.apply(null, arguments);
  opt = args.opt;
  cb = args.cb;
  log.debug('initialize browser with options :', opt);
  return new Promise(
    function (resolve/*, reject*/) {
      state.browser = webdriverio.remote(opt).init();
      resolve();
    })
    .then(function () {
      return webbot.addBrowserCommands(opt);
    })
    .nodeify(cb);
};

webbot.loadScenarioConfig = function (opt, cb) {
  var args = util.optionCallbackArgParser.apply(null, arguments)
    , scenarioConfig = {};
  opt = args.opt;
  cb = args.cb;
  return new Promise(
    function (resolve/*, reject*/) {
      state.scenario = {
        env: opt.env, name: opt.name
      };
      if (!state.scenario.name) {
        throw new Error('no scenario name specified');
      }
      try {
        scenarioConfig.default = require(path.join(config.baseDir, 'config', 'scenarii', 'default', state.scenario.name)); // load the common configuration for all environments
        log.debug('scenario default config loaded');
      } catch (err) {
        if (err.code !== 'MODULE_NOT_FOUND') {
          throw err;
        }
      }
      scenarioConfig.default = scenarioConfig.default || {};
      if (state.scenario.env) {
        try {
          scenarioConfig.scenario = require(path.join(config.baseDir, 'config', 'scenarii', state.scenario.env, state.scenario.name));
          log.debug('scenario config loaded');
        } catch (err) {
          if (err.code === 'MODULE_NOT_FOUND') {
            log.warn(err);
          } else {
            throw err;
          }
        }
      }
      scenarioConfig.effective = util.buildEffectiveConfig(scenarioConfig.default, scenarioConfig.scenario); // merge the all configuration and the one matching current environment
      state.scenario.config = scenarioConfig.effective;
      log.debug('scenario config : ', state.scenario);
      resolve();
    })
    .nodeify(cb);
};

webbot.playScenario = function (opt, cb) {
  var args = util.optionCallbackArgParser.apply(null, arguments)
    , scenario;
  opt = args.opt;
  cb = args.cb;
  log.info('using browser : %s%s [platform : %s]',
    opt.browser.desiredCapabilities.browserName,
    opt.browser.desiredCapabilities.version ? '/' + opt.browser.desiredCapabilities.version : '',
    opt.browser.desiredCapabilities.platform
  );
  return webbot
    .loadScenarioConfig(opt.scenario)
    .then(function () {
      scenario = webbot.getScenario();
      log.debug('scenario :', scenario);
      if (scenario.timeout) {
        opt.mocha.timeout = scenario.timeout;
      }
      return webbot.init(opt);
    })
    .then(function () {
      var Mocha = require('mocha')
        , mocha = new Mocha(opt.mocha);
      return new Promise(
        function (resolve/*, reject*/) {
          mocha.addFile(path.join(config.baseDir, 'scenarii', scenario.name));
          mocha.run(function (failures) {
            log.debug('mocha failures :', failures);
            process.on('exit', function () {
              process.exit(failures ? 1 : 0);
            });
            resolve();
          });
        });
    })
    .then(function () {
      return webbot.stopSelenium(opt.selenium);
    })
    .nodeify(cb);
};

webbot.startSelenium = function (opt, cb) {
  var args = util.optionCallbackArgParser.apply(null, arguments);
  opt = args.opt;
  cb = args.cb;
  return new Promise(
    function (resolve/*, reject*/) {
      log.debug('starting selenium server');
      state.server = selenium.start(opt.spawn, opt.args);
      ['stderr', 'stdout'].forEach(function (output) {
        state.server[output].on('data', function (data) {
          var line = data.toString().trim();
          log.trace('selenium - %s - %s', output, line);
          if (line.indexOf('Started HttpContext[/wd,/wd]') > -1) {
            ['stderr', 'stdout'].forEach(function (output) {
              state.server[output].removeAllListeners('data');
            });
            state.serverRunning = true;
            resolve();
          }
        });
      });
    })
    .then(function () {
      log.debug('selenium server started');
    })
    .nodeify(cb);
};

webbot.stopSelenium = function (opt, cb) {
  var args = util.optionCallbackArgParser.apply(null, arguments);
  opt = args.opt;
  cb = args.cb;
  return new Promise(
    function (resolve/*, reject*/) {
      var result = false;
      if (state.server && state.serverRunning) {
        state.server.kill();
        result = true;
      }
      state.server = null;
      state.serverRunning = false;
      resolve(result);
    })
    .then(function (result) {
      if (result) {
        log.debug('selenium server stopped');
      } else {
        log.debug('selenium server not running');
      }
      return result;
    })
    .nodeify(cb);
};