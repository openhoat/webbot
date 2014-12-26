'use strict';

var webbot = require('./webbot')
  , chai = require('chai')
  , expect = chai.expect
  , should = chai.should()
  , util = require('hw-util')
  , fs = require('fs')
  , async = require('async')
  , ErrorHandler = require('../node_modules/webdriverio/lib/utils/ErrorHandler')
  , logFactory = util.logFactory
  //, log = logFactory('client-commands')
  , browserLog = logFactory('browser')
  , clientCommands = exports;

clientCommands.checkLocalFile = function (file, content, timeout, callback) {
  var browser = this
    , config = webbot.getScenario().config
    , found, interval;
  found = false;
  interval = setInterval(function () {
    fs.exists(file, function (exists) {
      if (!exists) {
        return;
      }
      clearInterval(interval);
      found = true;
      fs.readFile(file, {encoding: 'utf-8'}, function (err, content) {
        should.not.exist(err);
        browser.log('Check downloaded file content');
        content.should.equal(config.file.content);
        callback();
      });
    });
  }, 1000);
  setTimeout(function () {
    found.should.be.true;
    clearInterval(interval);
  }, config.scenario.file && config.scenario.file.download && config.scenario.file.download.timeout || 30000);
  return browser;
};

clientCommands.findTextInList = function (options, callback) {
  var browser = this;
  callback = callback || function (err, result) {
    should.not.exist(err, util.format('Error :', err));
    result.value.match.should.be.ok;
  };
  browser
    .execute(function (options) {
      var items, i, elt, filterIsRegexp, match
        , result = {
          index: -1,
          match: false,
          elts: []
        };
      filterIsRegexp = options.filter instanceof RegExp;
      items = document.querySelectorAll(options.listSelector);
      for (i = 0; !result.match && i < items.length; i++) {
        elt = options.eltSelector ? items[i].querySelector(options.eltSelector) : items[i];
        match = filterIsRegexp ? elt.textContent.match(options.filter) : elt.textContent.trim() === options.filter;
        if (match) {
          result.index = i;
          result.match = match;
        }
      }
      return result;
    }, options, callback);
  return browser;
};

clientCommands.getExistingText = function (selector, expectedValue, callback) {
  var browser = this;
  browser
    .getText(selector, function (err, value) {
      should.not.exist(err, util.format('Selector %s not found', selector));
      value.should.equal(expectedValue);
    })
    .call(callback);
  return browser;
};

clientCommands.getExistingTitle = function (expectedValue, callback) {
  var browser = this;
  browser
    .getTitle(function (err, value) {
      should.not.exist(err, 'Page title not found');
      value.should.equal(expectedValue);
    })
    .call(callback);
  return browser;
};

clientCommands.log = function () {
  var browser = this
    , args = Array.prototype.slice.call(arguments)
    , callback = args.pop();
  browser.logIndex = browser.logIndex ? ++browser.logIndex : 1;
  args[0] = util.format('#%s - %s', browser.logIndex, args[0]);
  browser.call(function () {
    browserLog.info.apply(browser, args);
    callback();
  });
  return browser;
};

clientCommands.waitAndCheckText = function (selector, timeout, expectedText, callback) { // Attend qu'un selector aie la valeur attendue
  var browser = this;
  browser
    .waitForExist(selector, timeout, function (err, exists) {
      expect(err).not.to.be.ok;
      expect(exists).to.be.true;
    })
    .getText(selector, webbot.expectValueChecker(expectedText))
    .call(callback);
  return browser;
};

clientCommands.waitForSomething = function (selector, someFunc, someArgs, timeout) { // Attend quelque chose définit par une fonction
  var callback
    , self = this
    , response = {};
  callback = arguments[arguments.length - 1];
  if (typeof selector !== 'string') {
    return callback(new ErrorHandler.CommandError('number or type of arguments don\'t agree with waitForChecked command'));
  }
  if (typeof timeout !== 'number') {
    timeout = 500;
  }
  async
    .waterfall([
      function (cb) {
        self.timeoutsAsyncScript(timeout, cb);
      },
      function (res, cb) {
        response.timeoutsAsyncScript = res;
        self.selectorExecuteAsync(selector, someFunc, someArgs, cb);
      },
      function (result, res, cb) {
        response.selectorExecuteAsync = res;
        cb();
      }
    ], function (err) {
      callback(err, response.selectorExecuteAsync && response.selectorExecuteAsync.executeAsync ? response.selectorExecuteAsync.executeAsync.value : false, response);
    });
};