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
  it('should play a google doc web test scenario', function (done) {
    var startTime, completed;
    this.timeout(20000);
    startTime = process.hrtime();
    completed = function (err) {
      var elapsedTime = process.hrtime(startTime);
      webBot.logger.info('WebBotjs test took %s seconds', elapsedTime);
      done(err);
    };
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
        webBot.runStepsFromGdocScenario({
            gdocKey: '0AilC0U4Eb0tjdDRObHlrTDMySms2d0dGZUhWQi10Wmc',
            sheetIndex: 0
          },
          deferred.makeNodeResolver()
        );
        return deferred.promise;
      }).
      then(completed).
      catch(completed);
  });
});