var scenarioConfig = require('./scenario-config');

describe(scenarioConfig.name, function () {
  it('should execute all steps', function (done) {
    var webBot = scenarioConfig.webBot;
    webBot.runSteps(done);
  });
});