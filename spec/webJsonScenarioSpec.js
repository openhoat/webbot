var path = require('path')
  , Q = require('q')
  , WebBot = require('../lib/web-bot')
  , specUtil = require('./spec-util')
  , baseDir, webBot;

baseDir = path.join(__dirname, '..');

describe('Automate web visit', function () {
  afterEach(function (done) {
    specUtil.stopWebServer(webBot.logger, done);
  });
  it('should play a json web test scenario', function (done) {
    var startTime, completed, jsonWebScenario;
    this.timeout(2000);
    startTime = process.hrtime();
    completed = function (err) {
      var elapsedTime = process.hrtime(startTime);
      webBot.logger.info('WebBotjs test took %s seconds', elapsedTime);
      done(err);
    };
    webBot = new WebBot(baseDir);
    jsonWebScenario = [
      { action: 'init', param1: 'http://localhost:3000', param2: '' },
      { action: 'visit', param1: '/hello.html', param2: '' },
      { action: 'html' },
      { action: 'assert', param1: "expect(browser.text('title')).to.equal('Hey')", param2: "expect(browser.text('h1')).to.equal('Hello')" },
      { action: 'fill', param1: "input[type=text]", param2: "this is the value" },
      { action: 'press', param1: "input[type=submit]" },
      { action: 'wait' },
      { action: 'assertText', param1: 'body > h1', param2: 'Done' },
      { action: 'assertText', param1: 'body > h2', param2: 'this is the value' }
    ];
    Q().
      then(function () {
        var deferred = Q.defer();
        webBot.init(deferred.makeNodeResolver());
        return deferred.promise;
      }).
      then(function () {
        var deferred = Q.defer();
        specUtil.startWebServer(webBot.logger, deferred.makeNodeResolver());
        return deferred.promise;
      }).
      then(function () {
        var deferred = Q.defer();
        webBot.runStepsFromJsonScenario(jsonWebScenario, deferred.makeNodeResolver());
        return deferred.promise;
      }).
      then(completed).
      catch(completed);
  });
});