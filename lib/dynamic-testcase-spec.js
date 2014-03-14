var util = require('util')
  , scenarioConfig = require('./scenario-config');

describe(scenarioConfig.name, function () {
  var webBot = scenarioConfig.webBot;
  webBot.steps.forEach(function (step) {
    it(util.format('#%s %s', step.index, step.description), step.test);
  });
});