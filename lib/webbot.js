var util = require('./util')
  , hwLogger = require('hw-logger')
  , Q = require('q')
  , Browser = require('zombie')
  , request = require('request')
  , defaultConfig = require('./default-config')
  , logger = hwLogger.logger;

function WebBot(baseDir, configFile, configDir, defaultConfigName) {
  var that;
  that = this;
  that.initialized = false;
  that.config = WebBot.loadConfig(baseDir, configDir, defaultConfigName);
  that.actions = {};
  //that.log = WebBot.log;
  //that.log.level = that.config.log.level;
  that.initialized = false;
}

WebBot.loadConfig = function (options) {
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
    hwLogger.init(config.log);
  }
  return config;
};

WebBot.prototype.util = WebBot.util = util;

WebBot.prototype.init = function (callback) {
  var that, key;
  that = this;
  that.browser = new Browser();
  that.steps = [];
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
        logger.trace('found action "%s"', key);
        that.actions[key] = action;
        if (typeof action.init === 'function') {
          inits.push(asyncInit(action));
        }
      }
      return inits;
    }).
    all().
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

WebBot.prototype.buildScenarioFromJson = function (jsonDoc, callback) {
  var that;
  that = this;
  jsonDoc.forEach(function (item) {
    var action;
    if (item.disabled) {
      return;
    }
    item.index = that.steps.length + 1;
    action = that.actions[item.action];
    if (action && typeof action.build === 'function') {
      that.steps.push({
        index: item.index,
        description: item.description,
        test: action.build(that, item)
      });
    } else {
      throw util.format("Unknown action '%s' in #%s!", item.action, item.index);
    }
  });
  callback(null);
};

WebBot.prototype.buildScenarioFromDlJson = function (jsonDocUrl, callback) {
  var that;
  that = this;
  Q().
    then(function () {
      var deferred = Q.defer();
      request({ method: 'GET', uri: jsonDocUrl }, deferred.makeNodeResolver());
      return deferred.promise;
    }).
    spread(function (res, body) {
      var deferred = Q.defer();
      if (res.statusCode !== 200) {
        throw new Error(res.statusCode);
      }
      that.buildScenarioFromJson(JSON.parse(body), deferred.makeNodeResolver());
      return deferred.promise;
    }).
    then(callback).
    catch(callback);
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
  that.startTime = process.hrtime();
  that.steps.forEach(function (step) {
    nextPromise = nextPromise.then(function () {
      var deferred = Q.defer();
      step.test(deferred.makeNodeResolver());
      return deferred.promise;
    });
  });
  nextPromise.
    then(callback).
    catch(callback);
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
    then(function () {
      var deferred = Q.defer();
      if (that.initialized) {
        deferred.resolve();
      } else {
        that.init(deferred.makeNodeResolver());
      }
      return deferred.promise;
    }).
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
      if (that.initialized) {
        deferred.resolve();
      } else {
        that.init(deferred.makeNodeResolver());
      }
      return deferred.promise;
    }).
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

WebBot.prototype.runStepsFromDlJsonScenario = function (scenarioUrl, callback) {
  var that;
  that = this;
  Q().
    then(function () {
      var deferred = Q.defer();
      request({ method: 'GET', uri: scenarioUrl }, deferred.makeNodeResolver());
      return deferred.promise;
    }).
    spread(function (res, body) {
      var deferred = Q.defer();
      if (res.statusCode !== 200) {
        throw new Error(res.statusCode);
      }
      that.runStepsFromJsonScenario(JSON.parse(body), deferred.makeNodeResolver());
      return deferred.promise;
    }).
    then(callback).
    catch(callback);
};

module.exports = WebBot;