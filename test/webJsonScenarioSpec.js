var path = require('path')
  , WebBot = require('../lib/webbot')
  , specUtil = require('./spec-util')
  , logger = require('nice-logger').logger;

baseDir = path.join(__dirname, '..');

describe('Automate web visit', function () {
  var baseDir;
  baseDir = path.join(__dirname, '..');
  beforeEach(function (done) {
    specUtil.startWebServer(done);
  });
  afterEach(function (done) {
    specUtil.stopWebServer(done);
  });
  it('should play a json web test scenario', function (done) {
    var webBot, jsonWebScenario = require('./webScenario1.json');
    this.timeout(5000);
    webBot = new WebBot(baseDir);
    webBot.runStepsFromJsonScenario({ jsonScenario: jsonWebScenario }, completed);

    function completed(err) {
      var elapsedTime = webBot.elapsedTime();
      logger.info('WebBotjs test took %s seconds', elapsedTime);
      done(err);
    }
  });
});