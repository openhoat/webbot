var path = require('path')
  , WebBot = require('../lib/webbot')
  , specUtil = require('./spec-util')
  , logger = require('hw-logger').logger;

describe('Automate web service test', function () {
  var baseDir;
  baseDir = path.join(__dirname, '..');
  beforeEach(function (done) {
    specUtil.startWebServer(done);
  });
  afterEach(function (done) {
    specUtil.stopWebServer(done);
  });
  it('should play a downloaded json web test scenario', function (done) {
    var webBot, scenarioUri = 'http://localhost:3000/wsScenario1.json';
    this.timeout(2000);
    webBot = new WebBot(baseDir);
    webBot.runStepsFromDlJsonScenario({ scenarioUri:scenarioUri }, completed);

    function completed(err) {
      var elapsedTime = webBot.elapsedTime();
      logger.info('WebBotjs test took %s seconds', elapsedTime);
      done(err);
    }
  });
});