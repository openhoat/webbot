var path = require('path')
  , WebBot = require('../lib/webbot')
  , log = WebBot.log
  , specUtil = require('./spec-util');

describe('Automate web visit', function () {
  var baseDir;
  baseDir = path.join(__dirname, '..');
  beforeEach(function (done) {
    specUtil.startWebServer(done);
  });
  afterEach(function (done) {
    specUtil.stopWebServer(done);
  });
  it('should play a downloaded json web test scenario', function (done) {
    var webBot, scenarioUri = 'http://localhost:3000/webScenario1.json';
    this.timeout(2000);
    webBot = new WebBot(baseDir);
    webBot.runStepsFromDlJsonScenario(scenarioUri, completed);

    function completed(err) {
      var elapsedTime = webBot.elapsedTime();
      log.info('WebBotjs test took %s seconds', elapsedTime);
      done(err);
    }
  });
});