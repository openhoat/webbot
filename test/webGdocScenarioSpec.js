'use strict';

var path = require('path')
  , WebBot = require('../lib/webbot')
  , specUtil = require('./spec-util')
  , logger = require('nice-logger').logger;

describe('Automate web visit', function () {
  var baseDir;
  baseDir = path.join(__dirname, '..');
  beforeEach(function (done) {
    specUtil.startWebServer(done);
  });
  afterEach(function (done) {
    specUtil.stopWebServer(done);
  });
  it('should play a google doc web test scenario', function (done) {
    var webBot;

    function completed(err) {
      var elapsedTime = webBot.elapsedTimeMs();
      logger.info('WebBotjs test took %s seconds', elapsedTime / 1000);
      done(err);
    }

    this.timeout(20000);
    webBot = new WebBot(baseDir);
    webBot.runStepsFromGdocScenario({
      gdocScenario: {
        gdocKey: '0AilC0U4Eb0tjdDRObHlrTDMySms2d0dGZUhWQi10Wmc',
        sheetIndex: 0
      }
    }, completed);
  });
});