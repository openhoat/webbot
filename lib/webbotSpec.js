var path = require('path')
  , fs = require('fs')
  , WebBot = require('./webbot')
  , util = require('util')
  , scenarioConfig = require('./scenario-config');

baseDir = path.join(__dirname, '..');

describe('Automate web test', function () {
  var baseDir;
  baseDir = path.join(__dirname, '..');
  it('should play test scenario', function (done) {
    var webBot, jsonWebScenario = require('./../spec/webScenario1.json');
    webBot = new WebBot(baseDir);
    if (scenarioConfig.jsonScenario) {
      console.log('scenarioConfig.jsonScenario :', scenarioConfig.jsonScenario);
      webBot.runStepsFromJsonScenario(JSON.parse(fs.readFileSync(scenarioConfig.jsonScenario)), completed);
    } else if (scenarioConfig.scenarioUri) {
      webBot.runStepsFromDlJsonScenario(scenarioConfig.scenarioUri, completed);
    } else if (scenarioConfig.gdocKey) {
      webBot.runStepsFromGdocScenario({
        gdocKey: scenarioConfig.gdocKey,
        sheetIndex: scenarioConfig.sheetIndex
      }, completed);
    } else {
      throw new Error("Don't know what to play");
    }

    function completed(err) {
      var elapsedTime = webBot.elapsedTime();
      webBot.logger.info('WebBotjs test took %s seconds', elapsedTime);
      done(err);
    }
  });
});