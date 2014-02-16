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
    var jsonWebScenario;
    this.timeout(2000);
    webBot = new WebBot(baseDir);
    jsonWebScenario = [
      { index: '1', action: 'init', param1: 'http://localhost:3000', param2: '' },
      { index: '2', action: 'visit', param1: '/hello.html', param2: '' },
      { index: '3', action: 'assert', param1: "expect(browser.text('title')).to.equal('Hey')", param2: "expect(browser.text('h1')).to.equal('Hello')" }
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
      then(done).
      catch(done);
  });
});