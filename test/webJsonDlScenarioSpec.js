'use strict';

var path = require('path')
  , WebBot = require('../lib/webbot')
  , specUtil = require('./spec-util')
  , logger = require('nice-logger').logger;

describe('WebBot wide json scenario', function () {
  var baseDir;
  baseDir = path.join(__dirname, '..');
  before(function (done) {
    specUtil.startWebServer(done);
  });
  after(function (done) {
    specUtil.stopWebServer(done);
  });
  it('should play a downloaded json web test scenario', function (done) {
    var webBot
      , scenarioUri = 'http://localhost:3000/webScenario.json'
      , resources = require('./resources.json');

    function completed(err) {
      var elapsedTime = webBot.elapsedTime();
      logger.info('WebBotjs test took %s seconds', elapsedTime);
      done(err);
    }

    this.timeout(10000);
    webBot = new WebBot(baseDir);
    webBot.runStepsFromDlJsonScenario({ scenarioUri: scenarioUri, resources: resources }, completed);
  });
});