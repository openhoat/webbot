var path = require('path')
  , Q = require('q')
  , WebBot = require('../lib/web-bot')
  , specUtil = require('./spec-util');

describe('Automate web visit', function () {
  var baseDir, config;
  baseDir = path.join(__dirname, '..');
  config = WebBot.loadConfig(baseDir);
  beforeEach(function (done) {
    specUtil.startWebServer(config.logger, done);
  });
  afterEach(function (done) {
    specUtil.stopWebServer(config.logger, done);
  });
  it('should play a google doc web test scenario', function (done) {
    var webBot;
    this.timeout(20000);
    webBot = new WebBot(baseDir);
    webBot.runStepsFromGdocScenario({
      gdocKey: '0AilC0U4Eb0tjdDRObHlrTDMySms2d0dGZUhWQi10Wmc',
      sheetIndex: 0
    }, completed);

    function completed(err) {
      var elapsedTime = webBot.elapsedTimeMs();
      webBot.logger.info('WebBotjs test took %s seconds', elapsedTime / 1000);
      done(err);
    }
  });
});