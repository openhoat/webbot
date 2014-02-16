var util = require('./util')
  , Q = require('q')
  , Browser = require('zombie')
  , defaultConfig = require('./default-config');

function WebBot(deps, configDir, defaultConfigName, baseDir) {
  var that, args, config;
  that = this;
  that.initialized = false;
  args = util.parseArgs(arguments, [
    { name: 'deps', optional: true, type: 'object' },
    { name: 'configDir', optional: true, type: 'string'},
    { name: 'defaultConfigName', optional: true, type: 'string'},
    { name: 'baseDir', optional: true, type: 'string'}
  ]);
  that.log4js = (args.deps && args.deps['log4js']) || util.requireOptionnalDep('log4js');
  config = util.copyProperties(defaultConfig);
  util.copyProperties(util.loadConfig(args.configDir, args.defaultConfigName, 2, args.baseDir), config, false);
  that.config = util.configToAbsolutePaths(config, config.baseDir);
  that.actions = {};
}

WebBot.util = util;

WebBot.prototype.init = function (callback) {
  var that, key;
  that = this;
  that.logger = that.log4js.getLogger('console');
  if (that.config.log4js['level']) {
    that.logger.setLevel(that.config.log4js['level']);
  }
  Q().
    then(function () {
      var asyncInit, inits = [];
      asyncInit = function (action) {
        var deferred = Q.defer();
        action.init(that, deferred.makeNodeResolver());
        return deferred.promise;
      };
      for (key in that.config.actions) {
        var action;
        action = require(that.config.actions[key]);
        that.actions[key] = action;
        if (typeof action.init === 'function') {
          inits.push(asyncInit(action));
        }
      }
      return inits;
    }).
    all().
    then(function () {
      callback();
    }).
    catch(callback);
};

WebBot.prototype.buildScenarioFromJson = function (jsonDoc, callback) {
  var that;
  that = this;
  that.browser = new Browser();
  that.steps = [];
  jsonDoc.forEach(function (item) {
    var action, step;
    step = null;
    action = that.actions[item.action];
    if (action && typeof action.build === 'function') {
      that.steps.push(action.build(that, item));
    } else {
      throw util.format("Unknown action '%s' in #%s!", item.action, item.index);
    }
  });
  callback(null);
};

WebBot.prototype.buildScenarioFromGoogleDoc = function (options, callback) {
  var that = this;
  Q().
    then(function () {
      var deferred = Q.defer();
      util.googleSheetToJson(options, deferred.makeNodeResolver());
      return deferred.promise;
    }).
    then(function (jsonDoc) {
      that.buildScenarioFromJson(jsonDoc, callback);
    }).
    catch(callback);
};

WebBot.prototype.runSteps = function (callback) {
  var that
    , nextPromise;
  that = this;
  nextPromise = Q();
  that.steps.forEach(function (step) {
    nextPromise = nextPromise.then(step);
  });
  nextPromise.
    then(callback).
    catch(callback);
  return nextPromise;
};

WebBot.prototype.runStepsFromGdocScenario = function (options, callback) {
  var that;
  that = this;
  Q().
    then(function () {
      var deferred = Q.defer();
      that.buildScenarioFromGoogleDoc(options, deferred.makeNodeResolver());
      return deferred.promise;
    }).
    then(function () {
      var deferred = Q.defer();
      that.runSteps(deferred.makeNodeResolver());
      return deferred.promise;
    }).
    then(callback).
    catch(callback);
};

WebBot.prototype.runStepsFromJsonScenario = function (jsonWebScenario, callback) {
  var that;
  that = this;
  Q().
    then(function () {
      var deferred = Q.defer();
      that.buildScenarioFromJson(jsonWebScenario, deferred.makeNodeResolver());
      return deferred.promise;
    }).
    then(function () {
      var deferred = Q.defer();
      that.runSteps(deferred.makeNodeResolver());
      return deferred.promise;
    }).
    then(callback).
    catch(callback);
};

module.exports = WebBot;