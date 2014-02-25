var path = require('path')
  , Q = require('q')
  , WebBot = require('../lib/web-bot')
  , specUtil = require('./spec-util')
  , baseDir, webBot;

baseDir = path.join(__dirname, '..');

describe('Automate web service test', function () {
  afterEach(function (done) {
    specUtil.stopWebServer(webBot.logger, done);
  });
  it('should play a downloaded json web test scenario', function (done) {
    var scenarioUri= 'http://localhost:3000/wsScenario1.json';
    this.timeout(2000);
    webBot = new WebBot(baseDir);
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
        webBot.runStepsFromDlJsonScenario(scenarioUri, deferred.makeNodeResolver());
        return deferred.promise;
      }).
      then(completed).
      catch(completed);

    function completed(err) {
      var elapsedTime = webBot.elapsedTime();
      webBot.logger.info('WebBotjs test took %s seconds', elapsedTime);
      done(err);
    }
  });
});