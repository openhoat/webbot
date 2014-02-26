var path = require('path')
  , WebBot = require('../lib/web-bot')
  , specUtil = require('./spec-util');

describe('Automate web service test', function () {
  var baseDir, config;
  baseDir = path.join(__dirname, '..');
  config = WebBot.loadConfig(baseDir);
  beforeEach(function (done) {
    specUtil.startWebServer(config.logger, done);
  });
  afterEach(function (done) {
    specUtil.stopWebServer(config.logger, done);
  });
  it('should play a downloaded json web test scenario', function (done) {
    var webBot, scenarioUri = 'http://localhost:3000/wsScenario1.json';
    this.timeout(2000);
    webBot = new WebBot(baseDir);
    webBot.runStepsFromDlJsonScenario(scenarioUri, completed);

    function completed(err) {
      var elapsedTime = webBot.elapsedTime();
      webBot.logger.info('WebBotjs test took %s seconds', elapsedTime);
      done(err);
    }
  });
});