var path = require('path')
  , fs = require('fs')
  , WebBot = require('./webbot')
  , util = require('util')
  , log = WebBot.log
  , scenarioConfig = require('./scenario-config');

baseDir = path.join(__dirname, '..');

describe('Automate web test', function () {
  var baseDir;
  baseDir = path.join(__dirname, '..');
  it('should play test scenario', function (done) {
    var webBot, options;
    webBot = new WebBot(baseDir);
    if (scenarioConfig.jsonScenario) {
      options = JSON.parse(fs.readFileSync(scenarioConfig.jsonScenario));
      log.trace('scenario options :', JSON.stringify(options));
      webBot.runStepsFromJsonScenario(options, completed);
    } else if (scenarioConfig.scenarioUri) {
      options = scenarioConfig.scenarioUri;
      log.trace('scenario options :', options);
      webBot.runStepsFromDlJsonScenario(options, completed);
    } else if (scenarioConfig.gdocKey) {
      options = {
        gdocKey: scenarioConfig.gdocKey,
        sheetIndex: scenarioConfig.sheetIndex,
        googleAccount: scenarioConfig.googleAccount
      };
      log.trace('scenario options :', options);
      webBot.runStepsFromGdocScenario(options, completed);
    } else {
      throw new Error("missing scenario : don't know what to play");
    }

    function completed(err) {
      var elapsedTime = webBot.elapsedTime();
      log.info('WebBotjs test took %s seconds', elapsedTime);
      done(err);
    }
  });
});