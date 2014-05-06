'use strict';

var util = require('./util')
  , niceLogger = require('nice-logger')
  , Q = require('niceq')
  , Browser = require('zombie')
  , defaultConfig = require('./default-config')
  , logger = niceLogger.logger;

function WebBot(baseDir, configFile, configDir, defaultConfigName) {
  var that;
  that = this;
  that.initialized = false;
  that.config = WebBot.loadConfig(baseDir, configDir, defaultConfigName);
  that.actions = {};
  that.context = {};
  that.initialized = false;
}

WebBot.loadConfig = function () {
  var args, config;
  args = util.parseArgs(arguments, [
    { name: 'baseDir', optional: true, type: 'string'},
    { name: 'configDir', optional: true, type: 'string'},
    { name: 'defaultConfigName', optional: true, type: 'string'}
  ]);
  config = util.copyProperties(defaultConfig);
  util.copyProperties(util.loadConfig({ configDir: args.configDir, defaultConfigName: args.defaultConfigName, depth: 2, baseDir: args.baseDir }), config, false);
  util.configToAbsolutePaths(config, config.baseDir);
  if (config && config.log) {
    niceLogger.init(config.log);
  }
  return config;
};

WebBot.prototype.getClass = function () {
  return WebBot;
};
WebBot.prototype.util = WebBot.util = util;
WebBot.prototype.logger = WebBot.logger = logger;

WebBot.prototype.init = function (callback) {
  var that;
  that = this;
  that.browser = new Browser();
  that.steps = [];
  Q().
    niceAll(that.config.actions, function (value, key, next) {
      var action;
      action = require(value);
      logger.trace('found action "%s"', key);
      that.actions[key] = action;
      if (typeof action.init === 'function') {
        action.init(that, next);
      } else {
        next();
      }
    }).
    then(function () {
      that.initialized = true;
      callback();
    }).
    catch(callback);
};

WebBot.prototype.addAction = function (name, file) {
  var that;
  that = this;
  that.config.actions[name] = file;
};

WebBot.prototype.buildScenarioFromJson = function (options, callback) {
  var that;
  that = this;
  if (options.resources) {
    logger.trace('scenario has resources');
    util.computeResources(options.resources, that.logger);
  }
  options.jsonScenario.forEach(function (item) {
    var action;
    if (util.scenarioStepHasOption(item, 'disable')) {
      return;
    }
    item.index = that.steps.length + 1;
    action = that.actions[item.action];
    if (action && typeof action.build === 'function') {
      util.forEachItemParam(item, function (index, param) {
        item['param' + index] = util.populateResourcesForParam(options.resources, index, param, that.logger);
      });
      that.steps.push({
        index: item.index,
        description: item.description,
        test: action.build(that, item)
      });
    } else {
      throw util.format('Unknown action \'%s\' in #%s!', item.action, item.index);
    }
  });
  callback(null);
};

WebBot.prototype.buildScenarioFromDlJson = function (options, callback) {
  var that;
  that = this;
  Q().
    niceThen(function (next) {
      util.downloadJsonUri(options.scenarioUri, next);
    }).
    spread(function (jsonDoc) {
      that.buildScenarioFromJson({ jsonScenario: jsonDoc, resources: options.resources }, callback);
    }).
    catch(callback);
};

WebBot.prototype.buildScenarioFromGoogleDoc = function (options, callback) {
  var that = this;
  Q().
    niceThen(function (next) {
      util.googleSheetToJson(options.gdocScenario, next);
    }).
    then(function (jsonDoc) {
      that.buildScenarioFromJson({ jsonScenario: jsonDoc, resources: options.resources }, callback);
    }).
    catch(callback);
};

WebBot.prototype.runSteps = function (callback) {
  var that
    , nextPromise;
  that = this;
  nextPromise = Q();
  that.startTime = process.hrtime();
  that.steps.forEach(function (step) {
    nextPromise = nextPromise.niceThen(function (next) {
      step.test(next);
    });
  });
  nextPromise.
    niceDone(callback);
  return nextPromise;
};

WebBot.prototype.elapsedTime = function () {
  return process.hrtime(this.startTime);
};

WebBot.prototype.elapsedTimeMs = function () {
  var elapsed, elapsedMs;
  elapsed = this.elapsedTime();
  elapsedMs = parseInt((elapsed[0] * 1E9 + elapsed[1]) / 1E6, 10);
  return elapsedMs;
};

WebBot.prototype.runStepsFromGdocScenario = function (options, callback) {
  var that;
  that = this;
  Q().
    niceThen(function (next, resolve) {
      if (that.initialized) {
        resolve();
      } else {
        that.init(next);
      }
    }).
    niceThen(function (next) {
      that.buildScenarioFromGoogleDoc(options, next);
    }).
    niceThen(function (next) {
      that.runSteps(next);
    }).
    niceDone(callback);
};

WebBot.prototype.runStepsFromJsonScenario = function (options, callback) {
  var that;
  that = this;
  Q().
    niceThen(function (next, resolve) {
      if (that.initialized) {
        resolve();
      } else {
        that.init(next);
      }
    }).
    niceThen(function (next) {
      that.buildScenarioFromJson(options, next);
    }).
    niceThen(function (next) {
      that.runSteps(next);
    }).
    niceDone(callback);
};

WebBot.prototype.runStepsFromDlJsonScenario = function (options, callback) {
  var that;
  that = this;
  Q().
    niceThen(function (next) {
      util.downloadJsonUri(options.scenarioUri, next);
    }).
    niceThen(function (jsonDoc, next) {
      that.runStepsFromJsonScenario({ jsonScenario: jsonDoc }, next);
    }).
    niceDone(callback);
};

module.exports = WebBot;