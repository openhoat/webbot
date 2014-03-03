var pkg = require('../package')
  , program = require('commander')
  , path = require('path')
  , Mocha = require('mocha')
  , log = require('npmlog')
  , scenarioConfig = require('./scenario-config')
  , defaultConfig = require('../config/default')
  , mocha;

program
  .version(pkg.version)
  .usage('[options] "command with args"')
  .option('-g, --gdockey <n>', 'Google doc key')
  .option('-i, --sheetindex <n>', 'Google sheet index', parseInt, 1)
  .option('-p, --googleaccount <login:pwd>', 'Optional Google account', googleAccount)
  .option('-j, --json <n>', 'Scenario file in JSON format')
  .option('-d, --jsonuri <n>', 'Scenario JSON URI to download')
  .option('-l, --loglevel <ALL|TRACE|DEBUG|INFO|WARN|ERROR|FATAL|OFF>', 'Log level (see log4js for details)', 'INFO')
  .option('-C, --nocolors', 'force disabling of colors')
  .option('-c, --colors', 'force enabling of colors', true)
  .option('-t, --timeout <ms>', 'set test-case timeout in milliseconds [2000]')
  .option('-R, --reporter <name>', 'specify the reporter to use', 'spec')
  .option('-a, --actions <list>', 'custom actions list (key:path items separated by comma)', customActionList)
  .parse(process.argv);

mocha = new Mocha();
if (program.reporter) {
  mocha.reporter(program.reporter);
}
if (program.timeout) {
  mocha.suite.timeout(program.timeout);
}
if (program.nocolors) {
  mocha.useColors(false);
} else if (program.colors) {
  mocha.useColors(true);
}

defaultConfig.actions = program.actions;

if (program.nocolors) {
  log.disableColor();
}

scenarioConfig.jsonScenario = program.json;
scenarioConfig.scenarioUri = program.jsonuri;
scenarioConfig.gdocKey = program.gdockey;
scenarioConfig.sheetIndex = program.sheetindex;
scenarioConfig.googleAccount = program.googleaccount;

mocha.files = [ path.join(__dirname, 'webbotSpec') ];

mocha.run(process.exit);

function customActionList(actions) {
  var actionLines, result;
  result = {};
  actionLines = actions.split(',');
  actionLines.forEach(function (actionLine) {
    var actionSpecs = actionLine.split(':');
    result[actionSpecs[0]] = actionSpecs[1];
  });
  return result;
}

function googleAccount(googleAccount) {
  var accountSpecs = googleAccount.split(':');
  return {
    login: accountSpecs[0],
    password: accountSpecs[1]
  };
}