var path = require('path')
  , WebBot = require('../lib/webbot')
  , log = WebBot.log
  , specUtil = require('./spec-util');

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
    this.timeout(2000);
    webBot = new WebBot(baseDir);
    webBot.runStepsFromJsonScenario(jsonWebScenario, completed);

    function completed(err) {
      var elapsedTime = webBot.elapsedTime();
      log.info('WebBotjs test took %s seconds', elapsedTime);
      done(err);
    }
  });
});